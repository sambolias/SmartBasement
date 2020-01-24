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
