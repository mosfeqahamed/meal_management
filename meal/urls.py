from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MemberViewSet, MealEntryViewSet, PaymentViewSet, MonthlyReportView

router = DefaultRouter()
router.register('members', MemberViewSet)
router.register('meals', MealEntryViewSet)
router.register('payments', PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('report/', MonthlyReportView.as_view(), name='monthly-report'),
]