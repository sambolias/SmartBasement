from django.urls import path

from . import views

app_name = "lights"
urlpatterns = [
    path('', views.home, name='home'),
    path('cam', views.cam, name='cam'),
    path('lights', views.lights, name='lights'),
    path('outlets', views.outlets, name='outlets'),
    path('login', views.site_login, name='login'),
]