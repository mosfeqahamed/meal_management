from django.urls import path
from .views import OTPRequestView, OTPConfirmView

urlpatterns = [
    path('otp/request-reset/', OTPRequestView.as_view(), name='otp-request'),
    path('otp/confirm-reset/', OTPConfirmView.as_view(), name='otp-confirm'),
]
