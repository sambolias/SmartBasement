import RPi.GPIO as GPIO
from lights.models import Device

# TODO setup flipflop for SSR so that turning on light only requires a pulse
# this will allow cleanup every time page is called (won't need to leave pin HIGH)
class DevSwitch(object):
    def toggle(self, dev: Device):
        try:
            GPIO.setmode(GPIO.BCM)
            GPIO.setup(dev.pin, GPIO.OUT)
            GPIO.output(dev.pin, not GPIO.input(4))
        except:
            dev.power = False
            dev.save()
            GPIO.cleanup()
            return False
        # only close resource when it goes off
        # otherwise it won't stay on
        if GPIO.input(dev.pin) == GPIO.LOW:
            dev.power = False
            dev.save()
            GPIO.cleanup()
        else:
            dev.power = True
            dev.save()
