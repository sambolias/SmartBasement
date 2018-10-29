/*

  single header
  Bare bones sqlite3 class

*/
#pragma once
#include <string>
using std::string;
#include <sqlite3.h>

class DBHelper
{
public:
  void set_power(string device, bool value)
  {

  }

  void set_toggle(string device, bool value)
  {

  }

  bool get_power(string device)
  {
    bool power = false;

    return power;
  }

  bool get_toggle(string device)
  {
    bool toggle = false;

    return toggle;
  }
};
