from django.http import HttpResponse
from django.shortcuts import render, redirect, reverse
# from libs.lightswitch import DevSwitch
from .models import Device
from .models import Schedule
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
import datetime
import time
from pytz import timezone
# from time import gmtime, strftime
# print(strftime("%z", gmtime()))

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
    # in case the POST request was for something other than setting cam
    fallback = request.session.get('camera_preferred', '0')
    c = request.POST.get('camera_preferred', fallback)
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
    # in case the POST request was for something other than setting style
    fallback = request.session.get('style', 'dark')
    style = request.POST.get('style', fallback)
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

# returns the bits (see form values)
def date_to_bits(date):
  #           M  T  W  T  F  S  S
  day_bits = [0, 0, 0, 0, 0, 0, 0]
  day_bits[date.date().weekday()] = 1
  return day_bits
# returns array of 0 (mon) to 6 (sun) weekdays (like date.weekday)
def bits_to_weekdays(bits):
  days = []
  for i in range(0,6):
    if bits[i] == 1:
      days.append(i)
  return days

@login_required
def outlets(request):
  request.session['last_visited'] = '/outlets'

  outlets = Device.objects.filter(name="winter_outlets").first()
  now = datetime.datetime.now(timezone('US/Alaska')) # - datetime.timedelta(1)

  # can't directly compare datetime by date and time...
  next_on = Schedule.objects.filter ( on_time__year__gte=now.year
                                    , on_time__month__gte=now.month
                                    , on_time__day__gte=now.day
                                    , on_time__hour__gte=now.hour
                                    ).first()

  next_msg = 'No on times have been scheduled'
  if next_on:
    next_on = next_on.on_time
    next_msg = 'Next scheduled on time is ' + next_on.strftime("%Y-%m-%d %H:%M")
  outlet_msg = 'Outlets are powered ' + ('on' if outlets.power else 'off')
  #           M  T  W  T  F  S  S
  day_bits = [0, 0, 0, 0, 0, 0, 0]
  if request.method == 'POST':
    for i in range (0, 7):
      day_bits[i] = int(request.POST.get('day' + str(i), 0))
    if request.POST.get('single_date') and request.POST.get('single_start') and request.POST.get('single_end'):
      single_start = datetime.datetime.strptime(request.POST.get('single_date', '') + " " + request.POST.get('single_start', ''), "%Y-%m-%d %H:%M")
      single_end = datetime.datetime.strptime(request.POST.get('single_date', '') + " " + request.POST.get('single_end', ''), "%Y-%m-%d %H:%M")
      schedule = Schedule(on_time=single_start, off_time=single_end, pin=26, override_on=True, override_off=False, repeating=False)
      schedule.save()
    if request.POST.get('repeat_start') and request.POST.get('repeat_end'):
      for i in range (0, 7):
        start_time = datetime.datetime.strptime(request.POST.get('repeat_start', ''), "%H:%M").time()
        end_time = datetime.datetime.strptime(request.POST.get('repeat_end', ''), "%H:%M").time()
        if day_bits[i] == 1:
          weekday = now.date().weekday()
          if weekday == i and now.time() < end_time: # today and hasn't ended yet
            start_day = now.date()
          else:
            start_day = now.date() + datetime.timedelta(days=abs(i-weekday))
          repeat_start = datetime.datetime.strptime(start_day.strftime("%Y-%m-%d") + " " + request.POST.get('repeat_start', ''), "%Y-%m-%d %H:%M")
          repeat_end = datetime.datetime.strptime(start_day.strftime("%Y-%m-%d") + " " + request.POST.get('repeat_end', ''), "%Y-%m-%d %H:%M")
          schedule = Schedule(on_time=repeat_start, off_time=repeat_end, pin=26, override_on=False, override_off=False, repeating=True)
          schedule.save()

  context = { 'curr_time': now.strftime("%H:%M")
            , 'curr_date': now.strftime("%Y-%m-%d")
            , 'outlet': outlet_msg
            , 'next_on': next_msg
            , 'baseTemplate': getBaseTemplate(request)
            , 'style': getStyle(request)
            }

  return render(request, 'lights/outlets.html', context)
