from django.http import HttpResponse
from django.shortcuts import render
from libs.lightswitch import DevSwitch
from .models import Device


def index(request):
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

    context = {'light': status, 'error': error}

    # TODO determine if this should be impossible if manual switch toggle
    # seems little chance of this happening unless someone is doing it intentionally
    if request.method == 'POST' and not error:
        error = DevSwitch.toggle(light)
        # update context
        context['light'] = light.power
        context['error'] = error

    return render(request, 'lights/index.html', context)
