from django.db import models


# This is a basic device, used for light
class Device(models.Model):
    name = models.CharField(max_length=50)
    pin = models.IntegerField(default=4)
    power = models.BooleanField(default=False)
    # TODO make status field and abstract for more device types
