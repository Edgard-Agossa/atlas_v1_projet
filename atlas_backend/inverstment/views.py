from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from .models import Transaction, Portfolio, Member

class TransactionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = Transaction.objects.all().order_by('-date')
        data = []
        for transaction in transactions:
            data.append({
                'id': transaction.id,
                'type': transaction.type,
                'date': transaction.date,
                'portfolio': transaction.portfolio,
                'amount': transaction.amount,
                'asset': transaction.asset,
                'quantity': transaction.quantity,
                'price': transaction.price,
                'member_id': transaction.member_id,
                'description': transaction.description
            })
        return Response(data)

    def post(self, request):
        data = request.data
        required_fields = ['type', 'date', 'portfolio', 'amount']

        for field in required_fields:
            if field not in data:
                return Response({
                    'error': f'Le champ {field} est requis'
                }, status=status.HTTP_400_BAD_REQUEST)

        try:
            transaction = Transaction.objects.create(**data)
            return Response({
                'message': 'Transaction créée avec succès',
                'transaction': {
                    'id': transaction.id,
                    'type': transaction.type,
                    'date': transaction.date,
                    'portfolio': transaction.portfolio,
                    'amount': transaction.amount,
                    'description': transaction.description
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'error': f'Erreur lors de la création: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PortfolioListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        portfolios = Portfolio.objects.all()
        data = []
        for portfolio in portfolios:
            # Calculer les valeurs
            total_value = portfolio.cash
            holdings_value = portfolio.holdings.aggregate(
                total=Sum('quantity') * Sum('current_price')
            )['total'] or 0
            total_value += holdings_value

            data.append({
                'id': portfolio.id,
                'name': portfolio.name,
                'type': portfolio.type,
                'cash': portfolio.cash,
                'total_value': total_value,
                'holdings_count': portfolio.holdings.count(),
                'last_updated': portfolio.last_updated
            })
        return Response(data)

class MemberListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        members = Member.objects.all()
        data = []
        for member in members:
            data.append({
                'id': member.id,
                'name': member.name,
                'email': member.email,
                'phone': member.phone,
                'join_date': member.join_date,
                'total_contribution': member.total_contribution,
                'current_balance': member.current_balance,
                'invested_capital': member.invested_capital,
                'shares': member.shares,
                'status': member.status,
                'profile_type': member.profile_type
            })
        return Response(data)
