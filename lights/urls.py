from django.urls import path

from . import views

app_name = "lights"
urlpatterns = [
    path('', views.index, name='index'),
]