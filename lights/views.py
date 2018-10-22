from django.http import HttpResponse
from django.shortcuts import render
import RPi.GPIO as GPIO

def index(request):
    context = {}
    if request.method == 'POST':
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(4, GPIO.OUT)
        GPIO.output(4, not GPIO.input(4))
        # GPIO.cleanup()
    return render(request, 'lights/index.html', context)
