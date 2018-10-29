/*

  Daemon process to listen for RPi GPIO pin input
  from lightswitch, and db changes for site input
  uses sqlite3.h C++ library

*/
#include <iostream>
using std::cout;
#include <string>
using std::string;
#include <unistd.h>
//sleep()
#include <exception>
using std::exception;

#include "gpio.hpp"
#include "db-helper.hpp"

class PinListener
{
  //private members
  //this needs to come from conf - taken by cmd line
  string table = "lights_device";
  //database objects
  //TODO make these come from db
  int inPin = 20;
  string inDev = "office_lightswitch";
  int outPin = 4;
  string outDev = "office_light";

  //lib objects
  GPIO gpio;
  DBHelper db;

  //logic variables
  bool switchPower;
  bool sitePower;
  //bool switchToggle;
  bool siteToggle;
  //bool inputHigh;
  //bool outputHigh;

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
  }

public:
  void open_resources()
  {
    //open devices
    gpio.open_input(inPin);
    gpio.open_output(outPin);
  }

  void close_resources()
  {
    gpio.close(inPin);
    gpio.close(outPin);
  }

  void readDB()
  {
    switchPower = db.get_power(inDev);
    sitePower = db.get_power(outDev);
    siteToggle = db.get_toggle(outDev);
  }

  //catches manual lightswitch lo->hi and hi->lo
  bool inputToggled()
  {
    int input = gpio.input(inPin);
    //input from switch is hi
    if(input)
    {
      cout<<"switch hi\n";
      //switch wasn't high so this is toggle
      if(!switchPower)
        return true;
    }
    //input from switch is lo
    if(!input)
    {
      cout<<"switch lo\n";
      //switch was high so this is toggle
      if(switchPower)
          return true;
    }
    //else
    return false;
  }

  void toggleInput()
  {
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
    toggle_power();
    //reset site toggle
    db.set_toggle(outDev, false);
  }


};

//loop
int main(int argc, char **argv)
{

  PinListener pl;
  pl.open_resources();

  //listener loop
  float idle = .1;
  while(true) //doom
  {
    //update
    pl.readDB();

    //listen
    //prefer switch over site during conflict
    if(pl.inputToggled())
      pl.toggleInput();
    else if(pl.outputToggled())
      pl.toggleOutput();

    //idle
    sleep(idle);
  }

  //program shutdown
  pl.close_resources();
  return 0;
}
