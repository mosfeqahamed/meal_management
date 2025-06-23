from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenBlacklistView  # 👈 required for logout

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/meal/', include('meal.urls')),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('auth/jwt/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),  # 👈 add this line
]
