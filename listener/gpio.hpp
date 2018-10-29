/*

  single header
  Bare bones rpi gpio class

*/
#pragma once
#include <iostream>
using std::cout;
#include <fstream>
using std::ofstream;
using std::ifstream;
#include <string>
using std::string;
#include <exception>
using std::exception;

//not exception safe - need to try in listener
class GPIO
{

 public:

  void open_input(int pin)
  {
   open_close_dev(pin, 0, 1);
  }
  void open_output(int pin)
  {
   open_close_dev(pin, 1, 1);
  }
  void close(int pin)
  {
   open_close_dev(pin, 0, 0);
  }
  //direction: 0 for read 1 for write
  //close: 0 for unexport 1 for export
  void open_close_dev(int pin, bool direction, bool close)
  {
   //path to device
   string p1="/sys/class/gpio";
   string p2=p1+"/gpio"+pin;
   string path;
   //filestream to device
   ofstream gpio;
   //un/export device
   string open_close = (close) ? "/unexport" : "/export";
   try
   {
    path=p1+open_close;
    gpio.open(path.c_str());
    gpio<<pin;
    gpio.close();
   }
   catch(...)	//TODO catch and rethrow
   {
    throw new exception("Failed to export GPIO pin "+pin);
   }

   if(!close)
   {
     //specify using as input
     string dir = (direction) ? "in" : "out";
     try
     {
      path=p2+"/direction";
      gpio.open(path.c_str());
      gpio<<dir;
      gpio.close();
     }
     catch(...)
     {
       throw new exception("Failed to set as input GPIO pin "+pin);
     }
   }
  }

  int input(int pin)
  {
    //path to device
    string p1="/sys/class/gpio";
    string p2=p1+"/gpio"+pin;
    string path;

    //device value stored in file
    ifstream gpioIn;
    int value;
    //read
    try
    {
     path=p2+"/value";
     gpioIn.open(path.c_str());
     gpioIn>>value;
     gpioIn.close();
    }
    catch(...)
    {
      throw new exception("Failed to read value from input GPIO pin "+pin);
    }
    return value;
  }

  //lohi: 0 low 1 hi
  void output(int pin, bool lohi)
  {
    string p1="/sys/class/gpio";
	  string p2=p1+"/gpio"+pin;
    string path;
	  ofstream gpio;

    int command = (lohi) ? 1 : 0;

    try
    {
    	path=p2+"/value";
    	gpio.open(path.c_str());
    	gpio<<command;
    	gpio.close();
    }
    catch(...)
    {
      throw new exception("Failed to write to GPIO pin "+pin+" value "+(lohi)?"hi":"lo");
    }
  }
};