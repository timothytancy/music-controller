from django.db import models
import string
import random


def generate_unique_code():
    length = 6
    # generate new code and check for uniqueness
    while True:
        code = "".join(random.choices(string.ascii_uppercase, k=length))
        if Room.objects.filter(code=code).count() == 0:  # check all room objects and query code
            break
    return code


# Create your models here.
# we want fat models, thin views - put most of the logic on the models
class Room(models.Model):
    code = models.CharField(max_length=8, default=generate_unique_code, unique=True)  # constraints on field
    host = models.CharField(max_length=50, unique=True)
    guest_can_pause = models.BooleanField(null=False, default=False)
    votes_to_skip = models.IntegerField(null=False, default=1)
    created_at = models.DateTimeField(auto_now_add=True)
