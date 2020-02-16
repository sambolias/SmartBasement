from django.contrib.auth.models import User

# either manually create these users in db or make init_users.py that declares users like below

if User.objects.filter(username='admin') is None:
    User.objects.create_user(username='admin', password='admin')
if User.objects.filter(username='dude') is None:
    User.objects.create_user(username='dude', password='12345')
