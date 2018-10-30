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
#include <map>
using std::map;
#include <vector>
using std::vector;

class DBHelper
{
  sqlite3 *db;
  string TABLE;
  string PATH;
  map<string, vector<string>> rs;

  static int dbcallback(void *data, int argc, char **argv, char **col)
  {
    int i;
    //look into how to log this, or throw
    fprintf(stderr, "%s: ", (const char*)data);

    //store in class map obj
    for(i = 0; i<argc; i++)
    {
      //the key exists
      if(rs.find(col[i]) != map::end)
      {
        rs[col[i]].push_back((argv[i] ? argv[i] : "NULL" ))
      }
      else
        rs[col[i]] = (argv[i] ? { argv[i] } : { "NULL" });
    }
    return 0;
  }

  bool open_db()
  {
    int rc = sqlite3_open(PATH.c_str(), &db);
    if(rc)
    {
      cout<< "Couldn't open database: "+PATH+"\n"+sqlite3_errmsg(db)<<"\n";
      return false;
    }
    return true;
  }
  void close_db()
  {
    sqlite3_close(db);
  }

  bool query(string stm)
  {
    //clear storage map obj
    rs.clear();
    //set up params
    char *err = 0;
    int rc;
    char* sql = stm.c_str();
    const char* data;
    //attempt to open db
    if(!open_db())
      return false;
    //execute query
    rc = sqlite3_exec(db, sql, dbcallback, (void*)data, &err);

    bool success = true;
    if(rc != SQLITE_OK)
    {
      cout<< err <<"\n";
      sqlite3_free(err);
      success = false;
    }

    close_db();
    return success;
  }

public:
  DBHelper(string path, string table): PATH(path), TABLE(table)
  {
  }
  void set_power(string device, bool value)
  {

  }

  void set_toggle(string device, bool value)
  {

  }

  bool get_power(string device)
  {
    bool power = false;
    string sql = "select power from "+TABLE+" where name="+device+";";
    //this needs to pass down exceptions
    if(query(sql))
    {
        //rs good
        for(auto &kv : rs)
          cout<<k.first<<" = "<<k.second<<"\n";
    }

    return power;
  }



  bool get_toggle(string device)
  {
    bool toggle = false;

    return toggle;
  }
};
