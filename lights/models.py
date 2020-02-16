from django.db import models
# import RPi.GPIO as GPIO
from time import sleep


# This is a basic device, used for light
class Device(models.Model):
    name = models.CharField(max_length=50)
    pin = models.IntegerField(default=4)
    power = models.BooleanField(default=False)
    toggle = models.BooleanField(default=False)

class Schedule(models.Model):
    on_time = models.DateTimeField()
    off_time = models.DateTimeField()
    pin = models.IntegerField()
    override_on = models.BooleanField(default=False)
    override_off = models.BooleanField(default=False)
    repeating = models.BooleanField(default=False)

from SmartBasement import init_users

# switch wire needs to be on at init
# switch = Device.objects.filter(name="office_lightswitch").first()
# assert(switch is not None)
# GPIO.setmode(GPIO.BCM)
# GPIO.setup(switch.pin, GPIO.OUT)
# GPIO.output(switch.pin, GPIO.HIGH)

# seems like as good a place as any to connect listener
#gpio = Device.objects.filter(name="office_lightswitch").first()
#GPIO.setmode(GPIO.BCM)
#GPIO.setup(gpio.pin, GPIO.IN)


#def toggle_on(channel):
#    gpio.toggle = True
#    gpio.save()


#def toggle_off(channel):
    # wait to see if it stays off (or was slight voltage drop)
#    sleep(.5)
#    if GPIO.input(gpio.pin) == GPIO.LOW:
#        gpio.toggle = True
#        gpio.save()


#GPIO.add_event_detect(gpio.pin, GPIO.RISING, callback=toggle_on)
#GPIO.add_event_detect(gpio.pin, GPIO.FALLING, callback=toggle_off)
