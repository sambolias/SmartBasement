//TODO make this logger to log files to copy files erased etc
//save log for last run, and save log when files were copied or erased with date
//make logging to different logs use [] operator

//after setting up logs erase files
#pragma once

#include <vector>
using std::vector;
#include <deque>
using std::deque;
#include <map>
using std::map;
#include <string>
using std::string;
#include <iostream>
using std::cout;
#include <fstream>
using std::ofstream;
using std::ifstream;
#include <thread>
using std::thread;
#include <unistd.h>
//for sleep()
#include <memory>
using std::shared_ptr;
using std::make_shared;
#include <ctime>
#include <exception>
using std::exception;

// *** Global thread worker functions ***

// TODO how to make run a member function ??
void writeLog(string log, string name, bool overwrite = false)
{
  std::ios_base::openmode flags = ofstream::out;
  if(!overwrite)
    flags |= ofstream::app;
  ofstream ofs(name, flags);
  try
  {
    ofs << log << "\n"; //TODO add date, errorcode, etc
  }
  catch(exception &e)
  {
    cout<<"Logger["<<name<<"] error: "<<e.what()<<"\n";
    throw ("Logger["+name+"] error: "+e.what()+" - retrying...\n");
  }
  ofs.close();
}

void run(shared_ptr<deque<string>> &logs, string name)
{
  time_t curr = time(0);
  //this could throw - should probably catch and do something...
  writeLog("init log: " + name + " - " + ctime(&curr), name);
  while(logs->size())
  {
    if(logs->size() > 1)
    {
      string log = logs->at(1);
      logs->erase(logs->begin()+1);
      try
      {
        writeLog(log, name);
      }
      catch(exception &e)
      {
        //log error then pushbash log to attempt rewrite
        logs->push_back(e.what());
        logs->push_back(log);
      }
    }
    else usleep(500); //avoid busywait
  }
}

// worker manages threads that write logs asyncronously
class LogWorker
{

string get_timestamp()
{
  time_t raw;
  struct tm * timeinfo;
  char buffer[80];
  time(&raw);
  timeinfo = localtime(&raw);
  strftime(buffer, sizeof(buffer), "%H:%M:%S", timeinfo);
  return string(buffer);
}

public:

  LogWorker()
  {
    logs = make_shared<deque<string>>();
    logs->push_front("Running Signal");
  }

  shared_ptr<deque<string>> & getLogs()
  {
    return logs;
  }

  void operator=(string fname)
  {
    name = fname; //set name of logfile
    start();
  }

  void log(string log)
  {
    logs->push_back(get_timestamp() + " - " + log);
  }

  void start()
  {
    if(name.empty())
    {
      cout<<"LogWorker error: no log file given\n";
      throw ("LogWorker error: no log file given\n");
      return;
    }
    done=false;
    worker = thread(run, std::ref(logs), name);
  //  thread joins when stop is called
  }


  void stop()
  {
    done=true;
    //wait until logs have finished
    while(logs->size() > 1)
      usleep(500);
    //then remove signal log and join
    logs->pop_back();
    worker.join();
  }

  thread worker;
  shared_ptr<deque<string>> logs;
  string name;
  bool done;

};


class Logger
{
  map<string, LogWorker> loggers;
public:
  LogWorker & operator[](string name)
  {
    return loggers[name];
  }

  void set(string name, string path)
  {
    loggers[name]=path;
  }

};
