from django.contrib.auth.models import User

if User.objects.filter(username='serie') is None:
    User.objects.create_user(username='serie', password='fukitol1')
if User.objects.filter(username='kim') is None:
    User.objects.create_user(username='kim', password='newmommy')
if User.objects.filter(username='matthew') is None:
    User.objects.create_user(username='matthew', password='12345')