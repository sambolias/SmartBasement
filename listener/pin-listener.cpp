/*

  Daemon process to listen for RPi GPIO pin input
  from lightswitch, and db changes for site input
  uses sqlite3.h C++ library

*/
#include <algorithm>
using std::sort;
#include <iostream>
using std::cout;
#include <string>
using std::string;
#include <unistd.h>
//sleep()
#include <exception>
using std::exception;
#include <signal.h>
#include <ctime>
#include <vector>
using std::vector;

#include "gpio.hpp"
#include "db-helper.hpp"
#include "logger.hpp"
#include "pin-scheduler.hpp"


string get_timestamp()
{
  time_t raw;
  struct tm * timeinfo;
  char buffer[80];
  time(&raw);
  timeinfo = localtime(&raw);
  strftime(buffer, sizeof(buffer), "%m%d%Y", timeinfo);
  return string(buffer);
}

//TODO make pin-listener-debug.log
//log all the outputs in here
class PinListener
{
  //private members
  //this needs to come from conf - taken by cmd line
  string table = "lights_device";
  string scheduleTable = "lights_schedule";
  //database objects
  //TODO make these come from db
  int inPin = 20;
  string inDev = "office_lightswitch";
  int outPin = 4;
  string outDev = "office_lights";
  // TODO this should come from db
  int scheduledPin = 26;
  string scheduledDev = "winter_outlets";
  //lib objects
  GPIO gpio;
  DeviceDBHelper db;
  ScheduleDBHelper scheduler;
  Logger logger;

  // TODO generalize device and schedule so any amount can run
  // TODO Make ctor take list of device and schedule

  //logic variables
  bool switchPower;
  bool sitePower;
  //bool switchToggle;
  bool siteToggle;
  //bool inputHigh;
  //bool outputHigh;
  vector<PinScheduler> scheduled;
  bool scheduledPower;
  bool lastScheduledPower = false;

  /* switch logic

  - there is a switch that will connect 5v to input pin on raspberry pi
    when turned on
  - there is a webapp button that will set database objects toggle column
    when pressed

  - design  Lights will toggle whenever switch or button is toggled

  switch.power = s
  button.power = b
  button.toggle = t

  s = true set when input pin is hi - represents switch position - set here
  b = true set when actual light is on - set here
  t = true set when site button is pressed - set by site

  if s changes or t set toggle light - set s and b accordingly, reset t


  */
  //actually turns on/off light circuit
  //sets site.power with actual light power
  void toggle_power()
  {
    //power = !power
    int power = gpio.input(outPin);
    power = (power) ? 0 : 1;
    gpio.output(outPin, power);
    //set db
    db.set_power(outDev, power);
    cout<<"light was turned "<<(power ? "on" : "off")<<"\n";
    logger["pl"].log("light was turned "+string(power ? "on" : "off")+"\n");
  }

  // for sort, make override_off ahead of all else (other doesn't matter are =)
  static bool compareScheduled(const PinScheduler &a, const PinScheduler &b)
  {
    // only need to swap if off is on right
    return b.override_off && !a.override_off;
  }
  // pre: db has been read and populated scheduled with current objs
  // post: desired current pin on/off bool
  bool checkSchedule()
  {
    if(!scheduled.empty())
    {
      sort(scheduled.begin(), scheduled.end(), compareScheduled);
      if(!scheduled[0].override_off)
      {
        return true; // on time
      }
    }
    return false; // off if nothing or off time scheduled
  }


public:
  PinListener()
  {
    logger.set("pl", "/var/log/pin-listener/listener-debug."+get_timestamp()+".log");
  }

   //make sure pins were exported on close
  ~PinListener()
  {
    try
    {
        gpio.close(inPin);
    }
    catch(...)
    {
        //catch all no throw
    }
    try
    {
        gpio.close(outPin);
    }
    catch(...)
    {
        //catch all no throw
    }

  }

  void open_resources()
  {
    //open devices
    gpio.open_input(inPin);
    gpio.open_output(outPin);
    db = DeviceDBHelper("/home/serie/dev/django/SmartBasement/db.sqlite3", table);
    gpio.open_output(scheduledPin);
    scheduler = ScheduleDBHelper("/home/serie/dev/django/SmartBasement/db.sqlite3", scheduleTable);
    //set initial power state from saved state
    int state = db.get_power(outDev);
    gpio.output(outPin, state);
    logger["pl"].log("Beginning state: "+string(state ? "on" : "off")+"\n");
  }

  void close_resources()
  {
    logger["pl"].stop();
    gpio.close(inPin);
    gpio.close(outPin);

  }

  void readDB()
  {
    switchPower = db.get_power(inDev);
    sitePower = db.get_power(outDev);
    siteToggle = db.get_toggle(outDev);

    // gets vector of pinschedulers
    scheduled = scheduler.getCurrent();
    // handle multiple schedule object logic
    scheduledPower = checkSchedule();
  }

  // todo better than this rediculousness
  bool first_run=true;
  void handleScheduledPower()
  {
    // int power = scheduledPower;
    // power = (power) ? 0 : 1;
    // only make changes if change
    if(lastScheduledPower != scheduledPower || first_run)
    {
      first_run = false;
      gpio.output(scheduledPin, scheduledPower);
      // cout<<"changed scheduled power";
      //set db
      db.set_power(scheduledDev, scheduledPower);
      logger["pl"].log("Scheduled change\n");
    }
    lastScheduledPower = scheduledPower;
  }

  //catches manual lightswitch lo.hi and hi.lo
  bool inputToggled()
  {
    //take avg to clean up misread 1s when input should be 0
    //it is very sensitive, just touching the wire was setting it off...
    //TODO find most effective n for avg 10 was not enough 100 def works
    bool input = gpio.input(inPin);
    for(int i=0; i < 100; i++)
    {
        usleep(1);
        input &= gpio.input(inPin);
    }

    //input from switch is hi
    if(input)
    {
    //  cout<<"switch hi\n";
      //switch wasn"t high so this is toggle
      if(!switchPower)
      {
        cout<<"manual switch hi\n";
        logger["pl"].log("manual switch hi\n");
        return true;
      }
    }
    //input from switch is lo
    if(!input)
    {
    //  cout<<"switch lo\n";
      //switch was high so this is toggle
      if(switchPower)
      {
          cout<<"manual switch lo\n";
          logger["pl"].log("manual switch lo\n");
          return true;
      }
    }
    //else
    return false;
  }

  void toggleInput()
  {
	  //cout<<"light was toggled\n";
    toggle_power();
    //set switch in db
    db.set_power(inDev, !switchPower);
  }

  //when button is pressed site sets power like a toggle
  bool outputToggled()
  {
    return siteToggle;
  }

  //it is the responsibility of listener to reset toggle
  void toggleOutput()
  {
    cout<<"light was toggled\n";
    logger["pl"].log("light was toggled\n");
    toggle_power();
    //reset site toggle
    db.set_toggle(outDev, false);
  }


};

//global signal repeater
sig_atomic_t signaled = 0;
void set_signal(int arg)
{
    signaled = 1;
    cout<<"Terminate signal processed\n";
}

//loop
int main(int argc, char **argv)
{
  //register signal handlers
  void (*int_handler)(int);
  int_handler = signal(SIGINT, set_signal);
  void (*term_handler)(int);
  term_handler = signal(SIGTERM, set_signal);

  //create main resources
  PinListener pl;
  Logger logger;
  //spool up loggers
  string tm = get_timestamp();
  logger.set("gpio", "/var/log/pin-listener/gpio-debug."+tm+".log");
  logger.set("db", "/var/log/pin-listener/db-debug."+tm+".log");
  logger.set("debug", "/var/log/pin-listener/debug."+tm+".log");
  //export gpio pins
  try
  {
    pl.open_resources();
  }
  catch(exception &e)
  {
    logger["gpio"].log(e.what());
  }

  //listener loop
  int idle = 3;
  while(true) //doom loop catches signal for exit
  {
    //update
    try
    {
      pl.readDB();
    }
    catch(exception &e)
    {
      logger["db"].log(e.what());
      // if can"t read db don"t check pins
      // in unknown state
      continue;
    }
//cout<<"read\n";
    //listen

    // scheduled first
    pl.handleScheduledPower();

    //prefer switch over site during conflict
    bool toggled = false;
    try
    {
      toggled = pl.inputToggled();
    }
    catch(exception &e)
    {
      logger["gpio"].log(e.what());
    }
    if(toggled)
    try
    {
      pl.toggleInput();
    }
    catch(exception &e)
    {
      logger["gpio"].log(e.what());
    }
    else
    {
      try
      {
        toggled = pl.outputToggled();
      }
      catch(exception &e)
      {
        logger["gpio"].log(e.what());
        toggled = false;  //ensure not corrupted to true somehow
      }
      if(toggled)
      try
      {
        pl.toggleOutput();
      }
      catch(exception &e)
      {
        logger["gpio"].log(e.what());
      }
    }
    //catch signal for graceful exit
    if(signaled)
    {
      logger["debug"].log("program exiting from kill signal\n");
      break;
    }
    //idle
    usleep(idle);
  }

  //program shutdown
  try
  {
    pl.close_resources();
  }
  catch(exception &e)
  {
    logger["gpio"].log(e.what());
  }
  logger["gpio"].stop();
  logger["db"].stop();
  logger["debug"].stop();
  cout<<"program exited successfully\n";
  logger["debug"].log("program exited successfully\n");
  return 0;
}
