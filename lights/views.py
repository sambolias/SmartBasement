from django.http import HttpResponse
from django.shortcuts import render
import RPi.GPIO as GPIO
from .models import Device


def index(request):
    light = Device.objects.filter(name='office_lights').first()
    status = False
    error = False
    if light is not None:
        status = True
        error = True
    context = {'light': status, 'error': error}
    if request.method == 'POST' and light is not None:
        try:
            GPIO.setmode(GPIO.BCM)
            GPIO.setup(4, GPIO.OUT)
            GPIO.output(4, not GPIO.input(4))
        except:
            error = True
            pass
        # only close resource when it goes off
        # otherwise it won't stay on
        if GPIO.input(4) == GPIO.LOW:
            status = False
            GPIO.cleanup()
        else:
            status = True
        # update context
        context['light'] = status
        # update device model
        light.power = status
        light.save()
    return render(request, 'lights/index.html', context)
