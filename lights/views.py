from django.http import HttpResponse
from django.shortcuts import render, redirect
# from libs.lightswitch import DevSwitch
from .models import Device


def index(request):
    error = False

    switch = Device.objects.filter(name="office_lightswitch").first()
    if switch is None:
        error = True

    light = Device.objects.filter(name='office_lights').first()
    if light is None:
        error = True

    switch_msg = 'Manual switch is turned ' + ('on' if switch.power else 'off')
    light_msg = 'Light is powered ' + ('on' if light.power else 'off')

    context = {'switch': switch_msg, 'light': light_msg, 'error': error}

    # only possible post request is switch button pressed
    if request.method == 'POST' and not error:
        light.toggle = True
        light.save()
        # return redirect so post isn't resent on refresh
        return redirect('/')

    return render(request, 'lights/index.html', context)
