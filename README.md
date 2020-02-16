# SmartBasement


## setup apache server 

- install apache2
- make dir /srv/www/
- make symlink to SmartBasement root dir from /srv/www/<sitename>
- install wsgi `sudo apt-get install libapache2-mod-wsgi`
- move site conf to /etc/apache2/sites-available
- publish conf with `a2ensite <sitename>`
- make sure python and pip are installed
- install django globally `sudo -H python -m pip install --system django`
- `sudo systemctl reload apache2`

- from project root `python manage.py migrate`
- change ownership of db and root to www-data:www-data (or whoever runs apache) and make sure it has write permissions
- create lights_device table 

```sql 
CREATE TABLE IF NOT EXISTS "lights_device" 
  ( "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT
  , "name" varchar(50) NOT NULL
  , "pin" integer NOT NULL
  , "power" bool NOT NULL
  , "toggle" bool NOT NULL
  );


CREATE TABLE IF NOT EXISTS "lights_schedule" 
  ( "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT
  , "on_time" datetime NOT NULL
  , "off_time" datetime NOT NULL
  , "pin" integer NOT NULL
  , "override_on" bool NOT NULL DEFAULT FALSE
  , "override_off" bool NOT NULL DEFAULT FALSE
  , "repeating" bool NOT NULL DEFAULT TRUE
  );

insert into lights_device values (1,"office_lights",4,0,0);
insert into lights_device values (2,"office_lightswitch",20,0,0);
insert into lights_device values (3,"winter_outlets",26,0,0);
```

- create users through django 
  - for superuser `python manage.py createsuperuser --user <name> --email <mail>` 
  - will prompt for password
