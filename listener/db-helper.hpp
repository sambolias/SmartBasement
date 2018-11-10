/*

  single header
  Bare bones sqlite3 class

*/
#pragma once

#include <string>
using std::string;
#include <sqlite3.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <map>
using std::map;
#include <vector>
using std::vector;
#include <exception>
using std::exception;

map<string, vector<string>> rs;
  int dbcallback(void *data, int argc, char **argv, char **col)
  {
    //int i;
    //look into how to log this, or throw
    //  fprintf(stderr, "%s: ", (const char*)data);

    //store in class map obj
    for(int i = 0; i<argc; i++)
    {
      //the key exists
      if(rs.find(col[i]) != rs.end())
      {
        rs[col[i]].push_back((argv[i] ? argv[i] : "NULL" ));
      }
      else
        rs[col[i]].push_back(argv[i] ?  argv[i]  :  "NULL" );
    }
    return 0;
  }

class DBHelper
{
  sqlite3 *db;
  string TABLE="lights_device";
  string PATH="/home/serie/dev/django/SmartBasement/db.sqlite3";


  bool open_db()
  {
    int rc = sqlite3_open(PATH.c_str(), &db);
    if(rc)
    {
      cout<< "Couldn't open database: "+string(PATH)+"\n"+sqlite3_errmsg(db)+"\n";
      throw ("Couldn't open database: "+string(PATH)+"\n"+sqlite3_errmsg(db)+"\n");
      //return false;
    }
    return true;
  }
  void close_db()
  {
    sqlite3_close(db);
  }


  //TODO only retry for failed connection
  //throw otherwise
  //need to catch in pin-listener to ensure accuracy of db
  bool process(string stm)
  {
    bool success;
    do{
      //clear storage map obj
      rs.clear();
      //set up params
      char *err = 0;
      int rc;
      char* sql = &stm[0];
      const char* data;
      //attempt to open db
      //if(!open_db())
      //  return false;
      // may throw
      open_db();

      //execute query
      rc = sqlite3_exec(db, sql, dbcallback, (void*)data, &err);
      int tries = 0;
      success = true;
      string error;
      if(rc != SQLITE_OK)
      {
        cout<< err <<"\n";
        error = err;
        sqlite3_free(err);
        success = false;
        tries++;
        if(tries < 10)
        {
          cout<<"retrying\n";
        }
        else
        {
          cout<<"failed\n";
          throw (error + "\n");
          //break;
        }
        //attempt to give db some catchup time
        //failures were caused by back-to-back calls
        usleep(1);
      }
    }
    while(!success);

    close_db();
    return success;
  }

  bool get(string dev, string col)
  {
    string sql = "select "+col+" from "+TABLE+" where name=\""+dev+"\";";
    // may throw
    return process(sql);
  }

  //TODO overload to take other value types
  bool set(string dev, string col, bool value)
  {
      //bool evals to 1 or 0
      string val = (value) ? "1" : "0";
      string sql = "update "+string(TABLE)+" set "+col+" = "+val+" where name= \""+dev+"\";";
      // may throw
      return process(sql);
  }

public:
  DBHelper(){}
  DBHelper(string path, string table): PATH(path), TABLE(table)
  {
  }
  // all get and sets may throw exception
  void set_power(string device, bool value)
  {
    set(device, "power", value);
  }

  void set_toggle(string device, bool value)
  {
    set(device, "toggle", value);
  }

  bool get_power(string device)
  {
    bool power = false;
    //this needs to pass down exceptions
    if(get(device, "power"))
    {
	    if(rs.find("power") != rs.end())
      {
        if(rs["power"][0] == "1")
          power = true;
        else
          power = false;
	    } 
      else 
      {
        cout<<"power not found "<<device<<"\n";
        throw ("power not found "+device+"\n");
      }
        //rs good
        //for(auto &kv : rs)
        //  cout<<device<<"\n"<<kv.first<<" = "<<kv.second[0]<<"\n";
    }

    return power;
  }



  bool get_toggle(string device)
  {
    bool toggle = false;
    if(get(device, "toggle"))
    {
    if(rs.find("toggle") != rs.end())
    {
      if(rs["toggle"][0] == "1")
        toggle = true;
      else
        toggle = false;
    }
    else
    {
      cout<<"toggle not found\n";
      throw("toggle not found\n");
    }
    return toggle;

    }
  }
};
