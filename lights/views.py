from django.http import HttpResponse
from django.shortcuts import render
from libs.lightswitch import DevSwitch
from .models import Device


def index(request):
    import RPi.GPIO as GPIO
#    msg = 'Office Lights'
    error = False

    switch = Device.objects.filter(name="office_lightswitch").first()
    if switch is None:
        status = False
        error = True
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(switch.pin, GPIO.OUT)
    msg = 'Manual switch is turned '
    if switch.power:
        msg += ' off'
    else:
        msg += 'on'

    site = Device.objects.filter(name='office_lights').first()
    if site is None or switch is None:
        status = False
        error = True
    else:
        # check if the manual switch is on (power is off but power pin is hot)
        GPIO.setup(site.pin, GPIO.OUT)
        if GPIO.input(site.pin) == GPIO.HIGH and not site.power:
            switch.power = True
            switch.save()
        else:
            if GPIO.input(site.pin) == GPIO.LOW and not site.power and switch.power:
                error = DevSwitch.toggle(switch)
                switch.power = True  # reset to true because toggle turned off
                switch.save()

        # TODO comment out, this is confusing
        # TODO figure out how to handle case where switch is turned on when site has lights turned on
        # maybe one of the variable pins or some pulse that could be recognized?
        #    if GPIO.input(switch.pin) == GPIO.LOW
        # if light.toggle:
        #     msg = "TOGGLED!"
        #     error = DevSwitch.toggle(light)
        #     light.toggle = False
        #     light.save()
        # status = light.power

    context = {'light': status, 'msg': msg, 'error': error}

    # TODO determine if this should be impossible if manual switch toggle
    # seems little chance of this happening unless someone is doing it intentionally
    if request.method == 'POST' and not error:
        if switch.power:
            error = DevSwitch.toggle(switch)
        else:
            error = DevSwitch.toggle(site)
        # update context
        context['light'] = site.power or switch.power
        context['error'] = error

    return render(request, 'lights/index.html', context)
