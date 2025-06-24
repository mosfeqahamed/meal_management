from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import PasswordResetOTP

User = get_user_model()

class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, email):
        if not User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("No user with that email.")
        return email

class OTPConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=8)

    def validate(self, data):
        user = User.objects.filter(email__iexact=data['email']).first()
        otp = PasswordResetOTP.objects.filter(
            user=user,
            code=data['code'],
            used=False
        ).last()
        if not otp or otp.is_expired():
            raise serializers.ValidationError("Invalid or expired code.")
        data['user'] = user
        data['otp'] = otp
        return data
