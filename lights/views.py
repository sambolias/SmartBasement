from django.http import HttpResponse
from django.shortcuts import render
from libs.lightswitch import DevSwitch
from .models import Device


def index(request):
    import RPi.GPIO as GPIO
    from time import sleep
    gpio = Device.objects.filter(name="office_lightswitch").first()
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(gpio.pin, GPIO.IN)
    msg = str(GPIO.input(gpio.pin))+' Volts for pin '+str(gpio.pin)

    def toggle_on(channel):
        gpio.toggle = True
        gpio.save()

    def toggle_off(channel):
        # wait to see if it stays off (or was slight voltage drop)
        sleep(.5)
        if GPIO.input(gpio.pin) == GPIO.LOW:
            gpio.toggle = True
            gpio.save()

    GPIO.add_event_detect(gpio.pin, GPIO.RISING, callback=toggle_on)
    # GPIO.add_event_detect(gpio.pin, GPIO.FALLING, callback=toggle_off)

    light = Device.objects.filter(name='office_lights').first()
    error = False
    if light is None:
        status = False
        error = True
    else:
        if light.toggle:
            error = DevSwitch.toggle(light)
            light.toggle = False
            light.save()
        status = light.power

    context = {'light': status, 'msg': msg, 'error': error}

    # TODO determine if this should be impossible if manual switch toggle
    # seems little chance of this happening unless someone is doing it intentionally
    if request.method == 'POST' and not error:
        error = DevSwitch.toggle(light)
        # update context
        context['light'] = light.power
        context['error'] = error

    return render(request, 'lights/index.html', context)
