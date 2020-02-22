#pragma once

using std::string;

struct PinScheduler
{
  int id;
  // kept raw, only used for insertion
  string on_time;
  string off_time;
  int pin;
  bool override_on;
  bool override_off;
  bool repeating;

  // TODO make all strings and handle parse here
  // TODO make this take map of rs?
  PinScheduler
    ( int id
    , string on_time
    , string off_time
    , int pin
    , bool override_on
    , bool override_off
    , bool repeating
    ):
      id(id)
    , on_time(on_time)
    , off_time(off_time)
    , pin(pin)
    , override_on(override_on)
    , override_off(override_off)
    , repeating(repeating)
  {}

};
