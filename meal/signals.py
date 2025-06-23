from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Payment, Member
from django.db.models import Sum

@receiver([post_save, post_delete], sender=Payment)
def update_member_total_paid(sender, instance, **kwargs):
    member = instance.member
    total = member.payments.aggregate(total=Sum('amount'))['total'] or 0
    member.total_paid = total
    member.save()