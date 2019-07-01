from django.http import HttpResponse
from django.shortcuts import render, redirect, reverse
# from libs.lightswitch import DevSwitch
from .models import Device
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required



def site_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            last = request.session.get('last_visited', default='/')
            return redirect(last)

    return render(request, 'lights/login.html', { 'baseTemplate': getBaseTemplate(request), 'style': getStyle(request) })

def site_logout(request):
  logout(request)
  response = redirect('/') # request, 'lights/login.html', { 'baseTemplate': getBaseTemplate(request), 'style': getStyle(request) })
  response.delete_cookie('sessionid')
  return response
  # return render(request, 'lights/login.html', { 'baseTemplate': getBaseTemplate(request), 'style': getStyle(request) })

@login_required
def home(request):
    last = request.session.get('last_visited')
    if last:
        del request.session['last_visited']
        return redirect(last)
    request.session['last_visited'] = '/cam'
    return redirect('/cam', { 'baseTemplate': getBaseTemplate(request), 'style': getStyle(request) })


@login_required
def cam(request):
    request.session['last_visited'] = '/cam'
    if request.method == 'POST':
        c = request.POST.get('camera_preferred', '0')
        request.session['camera_preferred'] = c
        return render(request, 'lights/cam.html', { 'baseTemplate': getBaseTemplate(request), 'style': getStyle(request), 'camera_preferred': c })

    cid = request.session.get('camera_preferred', '0')
    return render(request, 'lights/cam.html', { 'baseTemplate': getBaseTemplate(request), 'style': getStyle(request), 'camera_preferred': cid })

def getBaseTemplate(request):
    if "Mobile" in request.META["HTTP_USER_AGENT"]:
        return "base-mobile.html"
    else:
        return "base.html"

def getStyle(request):
    style = request.session.get('style', 'dark')
    if request.method == 'POST':
        style = request.POST.get('style', 'dark')
        request.session['style'] = style
    return style

@login_required
def lights(request):
    request.session['last_visited'] = '/lights'
    error = False

    switch = Device.objects.filter(name="office_lightswitch").first()
    if switch is None:
        error = True

    light = Device.objects.filter(name='office_lights').first()
    if light is None:
        error = True

    switch_msg = 'Manual switch is turned ' + ('on' if switch.power else 'off')
    light_msg = 'Light is powered ' + ('on' if light.power else 'off')

    context = {'switch': switch_msg, 'light': light_msg, 'error': error, 'baseTemplate': getBaseTemplate(request), 'style': getStyle(request)}

    # only possible post request is switch button pressed
    if request.method == 'POST' and not error:
        light.toggle = True
        light.save()
        # return redirect so post isn't resent on refresh
        return redirect('/lights', context)

    return render(request, 'lights/lights.html', context)


@login_required
def outlets(request):
    request.session['last_visited'] = '/outlets'
    return render(request, 'lights/outlets.html', { 'baseTemplate': getBaseTemplate(request), 'style': getStyle(request) })
