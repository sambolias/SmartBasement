from django.db import models


# This is a basic device, used for light
class Device(models.Model):
    name = models.CharField()
    pin = models.IntegerField()
    power = models.BooleanField()
    # TODO make status field and abstract for more device types
