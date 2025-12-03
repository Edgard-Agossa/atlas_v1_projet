from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from .models import Transaction, Portfolio, Member, Holding, USDTPayment
from .serializers import HoldingSerializer
from .yfinance_service import YFinanceService
from .usdt_transaction.usdt_service import crypto_service
#importation de la classe AccountManager
from .account_manager.account import AccountManager
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
            # Récupérer les prix en temps réel pour les holdings
            holdings = portfolio.holdings.all()
            symbols = [holding.symbol for holding in holdings]
            current_prices = YFinanceService.get_multiple_prices(symbols)

            total_value = float(portfolio.cash)
            holdings_value = 0

            for holding in holdings:
                current_price = current_prices.get(holding.symbol, float(holding.current_price))
                holding_value = float(holding.quantity) * current_price
                holdings_value += holding_value

                # Mettre à jour le prix actuel dans la base de données
                holding.current_price = current_price
                holding.save()

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

class PortfolioView(APIView):
    permission_classes = [IsAuthenticated]

    #Recupération des portfolio
    def get(self, request):
        portfolios = Portfolio.objects.all()
        data = []
        for portfolio in portfolios:
            data.append({
                'id': portfolio.id,
                'name': portfolio.name,
                'type': portfolio.type,
                'cash': portfolio.cash,
                # 'created_by': portfolio.created_by,
                # 'created_at': portfolio.created_at.strftime('%Y-%m-%d %H:%M:%S') if portfolio.created_at else '',
                'is_active': portfolio.is_active
                })
        return Response(data)
    
    
    
    def post(self, request):
        # if request.user.role.name if request.user.role else None != 'admin':
        #     return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data
        if 'name' not in data or 'type' not in data:
            return Response({'error': 'Les champs name et type sont requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            portfolio = Portfolio.objects.create(
                name=data['name'],
                type=data['type'],
                cash=data.get('cash', 0),
                created_by=request.user
            )
            return Response({
                'message': 'Portefeuille créé avec succès',
                'portfolio': {
                    'id': portfolio.id,
                    'name': portfolio.name,
                    'type': portfolio.type,
                    'cash': portfolio.cash
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

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

class HoldingListCreateView(generics.ListCreateAPIView):
    queryset = Holding.objects.all()
    serializer_class = HoldingSerializer
    permission_classes = [IsAuthenticated]

class DepositView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request,member_id=None):
        try: 
            compte_id = request.data.get('compte_id')
            
            amount = request.data.get('amount')
            description= request.data.get('description')
            
            result = AccountManager.deposit(
                compte_id=compte_id,
                amount=float(amount),
                member_id=member_id,
                description=description,
                created_by=request.user
            )
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': f"Erreur lors du dépôt: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)

class WithdrawView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            compte_id = request.data.get('compte_id')
            amount = request.data.get('amount')
            description= request.data.get('description')
            
            result = AccountManager.withdraw(
                compte_id=compte_id,
                amount=float(amount),
                description=description,
                created_by=request.user
            )
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': f"Erreur lors du retrait: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)

class MemberAccountsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, member_id):
        try:
            accounts = AccountManager.get_member_accounts(member_id)
            return Response({
                'success': True,
                'accounts': [
                    {
                        'id': acc.id,
                        'account_number': acc.account_number,
                        'balance': acc.balance,
                        'portfolio': acc.portfolio.name,
                        'portfolio_type': acc.portfolio.type,
                        'is_active': acc.is_active
                    } for acc in accounts
                ]
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)            
class CreateMemberAccountsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, member_id):
        try:
            if member_id is None:
                return Response({
                    'success': False,
                    'message': "L'identifiant du membre est requis"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            result = AccountManager.creat_member_account(member_id=member_id)  # C'est un dict
            
            # Si des comptes ont été créés
            if result['created_accounts']:
                return Response({
                    'success': True,
                    'message': result['message'],
                    'accounts': [
                        {
                            'id': acc.id,
                            'account_number': acc.account_number,
                            'balance': float(acc.balance),
                            'portfolio': acc.portfolio.name,
                            'portfolio_type': acc.portfolio.type,
                            'is_active': acc.is_active
                        } for acc in result['created_accounts']  # Utiliser result['created_accounts']
                    ]
                }, status=status.HTTP_201_CREATED)
            else:
                # Aucun nouveau compte créé, retourner les comptes existants
                existing_accounts = AccountManager.get_member_accounts(member_id)
                return Response({
                    'success': True,
                    'message': result['message'],
                    'accounts': [
                        {
                            'id': acc.id,
                            'account_number': acc.account_number,
                            'balance': float(acc.balance),
                            'portfolio': acc.portfolio.name,
                            'portfolio_type': acc.portfolio.type,
                            'is_active': acc.is_active
                        } for acc in existing_accounts
                    ]
                }, status=status.HTTP_200_OK)
                
        except ValueError as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'message': f"Erreur inattendue: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class AccountTransactionsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, compte_id):
        try:
            limit = request.query_params.get('limit')
            if limit:
                limit = int(limit)
            
            transactions = AccountManager.get_account_transactions(compte_id, limit)
            return Response({
                'success': True,
                'transactions': [
                    {
                        'id': t.id,
                        'type': t.type,
                        'amount': t.amount,
                        'date': t.date,
                        'description': t.description,
                        'created_at': t.created_at
                    } for t in transactions
                ]
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)           

class AllTransactionsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            
            limit = request.query_params.get('limit')
            if limit:
                limit = int(limit)
            transactions = AccountManager.get_all_transactions(limit)
            return Response({
                'success': True,
                'transactions': [
                    {
                        'id': t.id,
                        'type': t.type,
                        'amount': t.amount,
                        'date_heure':  t.created_at.strftime('%d/%m/%Y %H:%M:%S'),
                        'description': t.description,
                        'portfolio': t.portfolio,
                        'created_at': t.created_at
                    } for t in transactions
                ]
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
            
#API pour le transfère usdt class CryptoPaymentInitView(APIView):

class CryptoPaymentInitView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            amount = request.data.get('amount')
            portfolio = request.data.get('portfolio')
            print(f"DEBUG: amount={amount}, portfolio={portfolio}") 
            
            if not amount or float(amount) <= 0:
                return Response({
                    'error': 'Montant invalide'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            result = crypto_service.create_payment_transaction(
                user=request.user,
                amount=amount,
                portfolio= portfolio
            )
            
            return Response(result, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CryptoPaymentVerifyView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            transaction_id = request.data.get('transactionId')
            tx_hash = request.data.get('txHash')
            
            if not transaction_id or not tx_hash:
                return Response({
                    'error': 'transactionId et txHash requis'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            success, message = crypto_service.process_payment(transaction_id, tx_hash)
            
            return Response({
                'success': success,
                'message': message
            }, status=status.HTTP_200_OK if success else status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CryptoTransactionStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, transaction_id):
        try:
            transaction = USDTPayment.objects.get(
                transaction_id=transaction_id,
                user=request.user
            )
            
            return Response({
                'transactionId': transaction.transaction_id,
                'status': transaction.status,
                'amount': str(transaction.amount_usdt),
                'createdAt': transaction.created_at,
                'expiresAt': transaction.expires_at,
                'paidAt': transaction.paid_at,
                'txnHash': transaction.tx_hash
            })
            
        except USDTPayment.DoesNotExist:
            return Response({
                'error': 'Transaction non trouvée'
            }, status=status.HTTP_404_NOT_FOUND)

class AdminCryptoTransactionsView(APIView):
    # permission_classes = [IsAdminUser]
    
    def get(self, request):
        try:
            # Filtres
            status_filter = request.query_params.get('status')
            date_from = request.query_params.get('date_from')
            date_to = request.query_params.get('date_to')
            
            transactions = USDTPayment.objects.all().order_by('-created_at')
            
            if status_filter:
                transactions = transactions.filter(status=status_filter)
            if date_from:
                transactions = transactions.filter(created_at__gte=date_from)
            if date_to:
                transactions = transactions.filter(created_at__lte=date_to)
            
            data = []
            for tx in transactions[:100]:  # Limite 100
                data.append({
                    'id': tx.id,
                    'transactionId': tx.transaction_id,
                    'user': tx.user.full_name,
                    'amount': str(tx.amount_usdt),
                    'status': tx.status,
                    'createdAt': tx.created_at,
                    'paidAt': tx.paid_at,
                    'txnHash': tx.tx_hash,
                    'receivedAmount': str(tx.received_amount) if tx.received_amount else None,
                    'senderAddress': tx.sender_address
                })
            
            return Response({
                'transactions': data,
                'total': transactions.count()
            })
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)