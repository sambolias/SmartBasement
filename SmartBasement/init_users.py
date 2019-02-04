from django.contrib.auth.models import User

if User.objects.get(username='serie') is None:
    User.objects.create_user(username='serie', password='fukitol1')
if User.objects.get(username='kim') is None:
    User.objects.create_user(username='kim', password='newmommy')