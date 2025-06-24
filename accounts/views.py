import random
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status, views
from rest_framework.response import Response
from django.contrib.auth import get_user_model

from .models import PasswordResetOTP
from .serializers import OTPRequestSerializer, OTPConfirmSerializer

User = get_user_model()

class OTPRequestView(views.APIView):
    permission_classes = []  # allow unauthenticated

    def post(self, request):
        ser = OTPRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        # Fetch the actual user instance
        email = ser.validated_data['email']
        user = User.objects.get(email__iexact=email)

        # Generate and store a 6-digit code
        code = f"{random.randint(0, 999999):06d}"
        PasswordResetOTP.objects.create(user=user, code=code)

        # Send it by email
        send_mail(
            subject="Your password reset code",
            message=f"Your code is: {code}\n\nIt expires in 15 minutes.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )
        return Response({"detail": "OTP sent."}, status=status.HTTP_200_OK)


class OTPConfirmView(views.APIView):
    permission_classes = []  # allow unauthenticated

    def post(self, request):
        ser = OTPConfirmSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        user = ser.validated_data['user']
        otp  = ser.validated_data['otp']
        new_pw = ser.validated_data['new_password']

        # Reset password and mark OTP used
        user.set_password(new_pw)
        user.save()

        otp.used = True
        otp.save()

        return Response({"detail": "Password reset successful."}, status=status.HTTP_200_OK)
