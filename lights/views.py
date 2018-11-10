from django.http import HttpResponse
from django.shortcuts import render, redirect
from libs.lightswitch import DevSwitch
from .models import Device


def index(request):
    error = False

    switch = Device.objects.filter(name="office_lightswitch").first()
    if switch is None:
        error = True

    msg = 'Manual switch is turned '
    if not switch.power:
        msg += 'off'
    else:
        msg += 'on'

    site = Device.objects.filter(name='office_lights').first()
    if site is None or switch is None:
        error = True
        # TODO comment out, this is confusing
        # TODO figure out how to handle case where switch is turned on when site has lights turned on
        # maybe one of the variable pins or some pulse that could be recognized?

    context = {'light': site.power, 'msg': msg, 'error': error}

    # TODO determine if this should be impossible if manual switch toggle
    # seems little chance of this happening unless someone is doing it intentionally
    if request.method == 'POST' and not error:
        site.toggle = True
        site.save()
        # update context
        # because toggle will change power we change it here
        # TODO maybe find a way to update more accurately
        # like js in view to update based on db listeners
        # context['light'] = not site.power
        # context['error'] = error
        # TODO use message for error
        return redirect('/')

    return render(request, 'lights/index.html', context)
