from django.db import models
from django.conf import settings

class Member(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    total_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)

class MealEntry(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='meals')
    date = models.DateField()
    count = models.PositiveIntegerField(default=0)

class Payment(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()