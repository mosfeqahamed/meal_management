from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import date
from django.db.models import Sum
import calendar  # CHANGED: added import

from .models import Member, MealEntry, Payment
from .serializers import MemberSerializer, MealEntrySerializer, PaymentSerializer

class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

class MealEntryViewSet(viewsets.ModelViewSet):
    queryset = MealEntry.objects.all()
    serializer_class = MealEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):  # CHANGED: restrict to user’s members
        return self.queryset.filter(member__user=self.request.user)

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):  # CHANGED: restrict to user’s members
        return self.queryset.filter(member__user=self.request.user)

class MonthlyReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # pull month/year from query params (default to today)
        month = int(request.query_params.get("month", date.today().month))
        year  = int(request.query_params.get("year",  date.today().year))

        members = Member.objects.filter(user=user)

        # --- CALCULATE TOTAL MEALS AS BEFORE ---
        total_meals = MealEntry.objects.filter(
            member__in=members,
            date__month=month,
            date__year=year
        ).aggregate(total=Sum('count'))['total'] or 0

        # --- SUM PAYMENTS AS BEFORE ---
        payments_qs = Payment.objects.filter(
            member__in=members,
            date__month=month,
            date__year=year
        )
        total_bazar = payments_qs.aggregate(total=Sum('amount'))['total'] or 0
        meal_rate = total_bazar / total_meals if total_meals > 0 else 0

        # --- BUILD FINANCIAL REPORT AS BEFORE ---
        financial_report = []
        for m in members:
            member_meal = MealEntry.objects.filter(
                member=m,
                date__month=month,
                date__year=year
            ).aggregate(Sum('count'))['count__sum'] or 0

            member_paid = payments_qs.filter(member=m).aggregate(
                total=Sum('amount')
            )['total'] or 0

            cost    = member_meal * meal_rate
            balance = member_paid - cost
            give    = abs(round(balance, 2)) if balance < 0 else 0
            take    = abs(round(balance, 2)) if balance > 0 else 0

            financial_report.append({
                "name":            m.name,
                "meal_count":      member_meal,
                "meal_rate":       round(meal_rate, 2),
                "total_meal_cost": round(cost, 2),
                "total_paid":      round(member_paid, 2),
                "give":            give,
                "take":            take
            })

        # --- NEW: BUILD DAILY MEAL COUNT MATRIX ---
        days_in_month = calendar.monthrange(year, month)[1]        
        days = list(range(1, days_in_month + 1))                   
        daily_summary = []                                         
        for m in members:                                          
            counts = {day: 0 for day in days}                     
            meals = MealEntry.objects.filter(                     
                member=m,
                date__year=year,
                date__month=month
            )                                                    
            for meal in meals:                                     
                counts[meal.date.day] = meal.count                

            daily_summary.append({                                
                "id":            m.id,
                "name":          m.name,
                "daily_counts":  counts
            })                                                     

        return Response({
            "total_bazar":     round(total_bazar, 2),
            "total_meals":     total_meals,
            "meal_rate":       round(meal_rate, 2),
            "financial_report": financial_report,
            "days":            days,            
            "daily_summary":   daily_summary     
        })
