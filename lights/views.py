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
        error = True
    # GPIO.setmode(GPIO.BCM)
    # GPIO.setup(switch.pin, GPIO.OUT)
    msg = 'Manual switch is turned '
    if not switch.power:
        msg += 'off'
    else:
        msg += 'on'

    site = Device.objects.filter(name='office_lights').first()
    if site is None or switch is None:
        error = True
    # else:
        # check if the manual switch is on (power is off but power pin is hot)
    #    GPIO.setup(site.pin, GPIO.OUT)
    #    if GPIO.input(site.pin) == GPIO.HIGH and not site.power:
    #        switch.power = True
    #        switch.save()
    #    else:
    #        if GPIO.input(switch.pin) == GPIO.LOW and not site.power and not switch.power:
    #            error = DevSwitch.toggle(switch)
    #            switch.power = False  # reset to false because toggle turned on
    #            switch.save()

        # TODO comment out, this is confusing
        # TODO figure out how to handle case where switch is turned on when site has lights turned on
        # maybe one of the variable pins or some pulse that could be recognized?

    context = {'light': switch.power, 'msg': msg, 'error': error}

    # TODO determine if this should be impossible if manual switch toggle
    # seems little chance of this happening unless someone is doing it intentionally
    if request.method == 'POST' and not error:
        site.toggle = True
        site.save()
        # if switch.power:
        #    error = DevSwitch.toggle(switch)
        #    site.power = switch.power
        #else:
        #    error = DevSwitch.toggle(site)
        #    switch.power = site.power
        # update context
        # because toggle will change power we change it here
        # TODO maybe find a way to update more accurately
        # like js in view to update based on db listeners
        context['light'] = not site.power
        context['error'] = error

    return render(request, 'lights/index.html', context)
