from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from django.db.models import Sum, Count
from .models import Transaction, Portfolio, Member, Holding, USDTPayment, MobileMoneyPayment
from .serializers import HoldingSerializer
from .yfinance_service import YFinanceService
from .usdt_transaction.usdt_service import crypto_service
#importation de la classe AccountManager
from .account_manager.account import AccountManager
from .uploadFileViews import AssetUploadView
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
            print(f"Field: {field}, Value: {data.get(field)}")
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
            print(f"DEBUG: Recherche comptes pour member_id={member_id}")
            accounts = AccountManager.get_member_accounts(member_id)
            print(f"DEBUG: Nombre de comptes trouvés: {len(accounts)}")
            return Response({
                'success': True,
                'accounts': [
                    {
                        'id': acc.id,
                        'account_number': acc.account_number,
                        'balance':  float(acc.balance),
                        'portfolio': acc.portfolio.name,
                        'portfolio_type': acc.portfolio.type,
                        'is_active': acc.is_active
                    } for acc in accounts
                ]
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"DEBUG: Erreur complète: {str(e)}")
            print(f"DEBUG: Type d'erreur: {type(e)}")
            import traceback
            print(f"DEBUG: Traceback: {traceback.format_exc()}")
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
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Vérification du rôle admin
        if not request.user.role or request.user.role.name != 'admin':
            return Response(
                {'error': 'Accès non autorisé. Rôle admin requis.'},
                status=status.HTTP_403_FORBIDDEN
            )
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
            
            

#pour le paiement par mobile money via fedapay
from .mobile_money.fedapay_service import fedapay_service

class MobileMoneyPaymentInitView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        signature = request.headers.get('X-FedaPay-Signature')
        try:
            amount = request.data.get('amount')
            phone_number = request.data.get('phone_number')
            payment_method = request.data.get('payment_method')
            portfolio = request.data.get('portfolio')
            
            # Validation
            if not all([amount, phone_number, payment_method, portfolio]):
                return Response({
                    'error': 'Tous les champs sont requis'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if float(amount) <= 0:
                return Response({
                    'error': 'Montant invalide'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            result = fedapay_service.create_transaction(
                user=request.user,
                amount=float(amount),
                phone_number=phone_number,
                payment_method=payment_method,
                portfolio=portfolio
            )
            
            if result['success']:
                return Response(result, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'error': result['error']
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
import hmac
import hashlib
from django.conf import settings


class MobileMoneyWebhookView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        # 1. Validation signature
        signature = request.headers.get('X-FedaPay-Signature')
        if not signature:
            return Response({'error': 'Signature manquante'}, status=400)
        
        try:
            # 2. Vérifier signature
            payload = request.body
            expected = hmac.new(
                settings.FEDAPAY_CONFIG['WEBHOOK_SECRET'].encode(),
                payload,
                hashlib.sha256
            ).hexdigest()
            
            if not hmac.compare_digest(signature, expected):
                return Response({'error': 'Signature invalide'}, status=401)
            
            # 3. Validation des données (FIX CWE-915)
            event_type = request.data.get('type')
            entity = request.data.get('entity', {})
            transaction_id = entity.get('id')
            
            if not all([event_type, transaction_id]):
                return Response({'error': 'Données incomplètes'}, status=400)
            
            # 4. Traitement sécurisé
            if event_type == 'transaction.approved':
                try:
                    payment = MobileMoneyPayment.objects.get(
                        fedapay_transaction_id=transaction_id
                    )
                    payment.status = 'APPROVED'
                    payment.save()
                    
                    fedapay_service.process_successful_payment(payment)
                    
                except MobileMoneyPayment.DoesNotExist:
                    return Response({'error': 'Transaction introuvable'}, status=404)
            
            return Response({'status': 'success'})
            
        # 5. Gestion d'erreurs spécifiques (FIX Error Handling)
        except (KeyError, ValueError) as e:
            return Response({'error': 'Données invalides'}, status=400)
        except Exception:
            return Response({'error': 'Erreur serveur'}, status=500)

class MobileMoneyStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, transaction_id):
        try:
            payment = MobileMoneyPayment.objects.get(
                transaction_id=transaction_id,
                user=request.user
            )
            
            return Response({
                'transaction_id': payment.transaction_id,
                'status': payment.status,
                'amount': str(payment.amount),
                'payment_method': payment.payment_method,
                'phone_number': payment.phone_number,
                'portfolio': payment.portfolio,
                'created_at': payment.created_at,
                'updated_at': payment.updated_at,
                'fedapay_reference': payment.fedapay_reference
            })
            
        except MobileMoneyPayment.DoesNotExist:
            return Response({
                'error': 'Transaction non trouvée'
            }, status=status.HTTP_404_NOT_FOUND)
#récupération des inverst

class MemberInvestmentsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            from .models import Compte_member
            
            # Filtrer uniquement les comptes de l'utilisateur connecté
            comptes = Compte_member.objects.filter(
                member=request.user
            ).select_related('portfolio', 'member')
            
            print(f"User: {request.user.email}, Comptes trouvés: {comptes.count()}")
            
            data = []
            for compte in comptes:
                data.append({
                    'id': compte.id,
                    'member_external_id': compte.member_external_id or 'N/A',
                    'email': compte.member.email,
                    'telephone': compte.member.phone or 'N/A',
                    'date_entree': compte.created_at.strftime('%d/%m/%Y'),
                    'balance': float(compte.balance),
                    'shares_count': float(compte.shares_count),
                    'gross_value': float(compte.gross_value),
                    'portfolio_type': compte.portfolio.type,
                    'portfolio_name': compte.portfolio.name,
                    'is_active': compte.is_active
                })
            
            return Response({'success': True, 'investments': data, 'total': len(data)})
            
        except Exception as e:
            print(f"ERROR: {e}")
            return Response({'success': False, 'error': str(e)}, status=500)
