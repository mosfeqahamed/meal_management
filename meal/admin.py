from django.contrib import admin
from .models import Member, MealEntry, Payment

admin.site.register(Member)
admin.site.register(MealEntry)
admin.site.register(Payment)
