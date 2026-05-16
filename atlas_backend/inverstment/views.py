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

    def get(self, request):
        portfolios = Portfolio.objects.all().select_related('created_by')
        data = []
        for portfolio in portfolios:
            data.append({
                'id': portfolio.id,
                'name': portfolio.name,
                'type': portfolio.type,
                'cash': float(portfolio.cash),
                'is_active': portfolio.is_active,
                'last_updated': portfolio.last_updated,
                'created_by': {
                    'id': portfolio.created_by.id,
                    'name': portfolio.created_by.full_name,
                } if portfolio.created_by else None,
            })
        return Response(data)

    def post(self, request):
        if not request.user.role or request.user.role.name != 'admin':
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=status.HTTP_403_FORBIDDEN)
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
                'portfolio': {'id': portfolio.id, 'name': portfolio.name, 'type': portfolio.type, 'cash': portfolio.cash}
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PortfolioDetailView(APIView):
    """PATCH / DELETE sur un portfolio — admin only."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, portfolio_id):
        if not request.user.role or request.user.role.name != 'admin':
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            portfolio = Portfolio.objects.get(id=portfolio_id)
            if 'name' in request.data:
                portfolio.name = request.data['name']
            if 'cash' in request.data:
                from decimal import Decimal
                portfolio.cash = Decimal(str(request.data['cash']))
            if 'is_active' in request.data:
                portfolio.is_active = bool(request.data['is_active'])
            portfolio.save()
            return Response({
                'success': True,
                'portfolio': {'id': portfolio.id, 'name': portfolio.name, 'type': portfolio.type, 'cash': float(portfolio.cash), 'is_active': portfolio.is_active}
            })
        except Portfolio.DoesNotExist:
            return Response({'error': 'Portfolio introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, portfolio_id):
        if not request.user.role or request.user.role.name != 'admin':
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            portfolio = Portfolio.objects.get(id=portfolio_id)
            # Vérifier qu'aucun compte membre n'est lié
            if portfolio.member_accounts.exists():
                return Response(
                    {'error': f'{portfolio.member_accounts.count()} compte(s) membre lié(s). Désactivez-les avant de supprimer.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            portfolio.delete()
            return Response({'success': True, 'message': 'Portfolio supprimé.'})
        except Portfolio.DoesNotExist:
            return Response({'error': 'Portfolio introuvable.'}, status=status.HTTP_404_NOT_FOUND)

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
            # Admin voit tous les comptes (actifs + inactifs), membre voit seulement les actifs
            is_admin = request.user.role and request.user.role.name == 'admin'
            accounts = AccountManager.get_member_accounts(member_id, include_inactive=is_admin)
            print(f"DEBUG: Nombre de comptes trouvés: {len(accounts)}")
            return Response({
                'success': True,
                'accounts': [
                    {
                        'id': acc.id,
                        'account_number': acc.account_number,
                        'balance':  float(acc.balance),
                        'shares_count': float(acc.shares_count),
                        'gross_value': float(acc.gross_value),
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

class ToggleAccountActiveView(APIView):
    """Admin — active ou désactive un compte membre (is_active)."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, compte_id):
        if not request.user.role or request.user.role.name != 'admin':
            return Response({'error': 'Accès réservé aux administrateurs.'},
                            status=status.HTTP_403_FORBIDDEN)
        try:
            from .models import Compte_member
            compte = Compte_member.objects.get(id=compte_id)
            compte.is_active = not compte.is_active
            compte.save()
            return Response({
                'success': True,
                'compte_id': compte.id,
                'is_active': compte.is_active,
                'message': f"Compte {'activé' if compte.is_active else 'désactivé'} avec succès."
            })
        except Compte_member.DoesNotExist:
            return Response({'error': 'Compte introuvable.'}, status=status.HTTP_404_NOT_FOUND)


class UpdateMemberAccountView(APIView):
    """Admin — met à jour les données financières d'un compte membre."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, compte_id):
        if not request.user.role or request.user.role.name != 'admin':
            return Response({'error': 'Accès réservé aux administrateurs.'},
                            status=status.HTTP_403_FORBIDDEN)
        try:
            from .models import Compte_member
            from decimal import Decimal, InvalidOperation
            compte = Compte_member.objects.get(id=compte_id)

            def to_dec(val):
                try:
                    return Decimal(str(val))
                except (InvalidOperation, TypeError):
                    return None

            if 'balance' in request.data:
                v = to_dec(request.data['balance'])
                if v is not None:
                    compte.balance = v
            if 'shares_count' in request.data:
                v = to_dec(request.data['shares_count'])
                if v is not None:
                    compte.shares_count = v
            if 'gross_value' in request.data:
                v = to_dec(request.data['gross_value'])
                if v is not None:
                    compte.gross_value = v
            if 'member_external_id' in request.data:
                compte.member_external_id = request.data['member_external_id']
            if 'is_active' in request.data:
                compte.is_active = bool(request.data['is_active'])

            compte.save()
            return Response({
                'success': True,
                'compte': {
                    'id': compte.id,
                    'account_number': compte.account_number,
                    'balance': float(compte.balance),
                    'shares_count': float(compte.shares_count),
                    'gross_value': float(compte.gross_value),
                    'member_external_id': compte.member_external_id,
                    'is_active': compte.is_active,
                    'portfolio': compte.portfolio.name,
                    'portfolio_type': compte.portfolio.type,
                }
            })
        except Compte_member.DoesNotExist:
            return Response({'error': 'Compte introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
                    'date_entree': compte.date_entree.strftime('%d/%m/%Y') if compte.date_entree else compte.created_at.strftime('%d/%m/%Y'),
                    'balance': float(compte.balance),
                    'shares_count': float(compte.shares_count),
                    'gross_value': float(compte.gross_value),
                    'promesse_annuelle': float(compte.promesse_annuelle) if compte.promesse_annuelle else 0,
                    'frais_gestion': float(compte.frais_gestion) if compte.frais_gestion else 0,
                    'capital_net': float(compte.capital_net) if compte.capital_net else 0,
                    'parts_pct': float(compte.parts_pct) if compte.parts_pct else 0,
                    'profit_type': compte.profit_type or '',
                    'portfolio_type': compte.portfolio.type,
                    'portfolio_name': compte.portfolio.name,
                    'is_active': compte.is_active
                })
            
            return Response({'success': True, 'investments': data, 'total': len(data)})
            
        except Exception as e:
            print(f"ERROR: {e}")
            return Response({'success': False, 'error': str(e)}, status=500)


class AllMemberAccountsView(APIView):
    """Admin — récupère tous les comptes membres avec détails complets."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Vérifier le code PIN avant d'accéder aux comptes."""
        try:
            # Vérifier que l'utilisateur est admin
            if not request.user.role or request.user.role.name != 'admin':
                return Response({
                    'success': False,
                    'error': 'Accès réservé aux administrateurs'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Vérifier le code PIN
            from decouple import config
            pin_code = request.data.get('pin_code')
            correct_pin = config('ADMIN_ACCOUNTS_PIN', default='2024')
            
            if not pin_code or str(pin_code) != str(correct_pin):
                return Response({
                    'success': False,
                    'error': 'Code PIN incorrect'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            from .models import Compte_member
            
            # Récupérer tous les comptes
            comptes = Compte_member.objects.all().select_related('portfolio', 'member', 'last_modified_by').order_by('-created_at')
            
            data = []
            for compte in comptes:
                data.append({
                    'id': compte.id,
                    'account_number': compte.account_number,
                    'member_external_id': compte.member_external_id or '',
                    'member_id': compte.member.id,
                    'member_name': f"{compte.member.first_name} {compte.member.last_name}",
                    'email': compte.member.email,
                    'telephone': compte.member.phone or '',
                    'date_entree': compte.date_entree.strftime('%Y-%m-%d') if compte.date_entree else '',
                    'balance': float(compte.balance),
                    'shares_count': float(compte.shares_count),
                    'gross_value': float(compte.gross_value),
                    'promesse_annuelle': float(compte.promesse_annuelle) if compte.promesse_annuelle else 0,
                    'frais_gestion': float(compte.frais_gestion) if compte.frais_gestion else 0,
                    'capital_net': float(compte.capital_net) if compte.capital_net else 0,
                    'parts_pct': float(compte.parts_pct) if compte.parts_pct else 0,
                    'profit_type': compte.profit_type or '',
                    'portfolio_type': compte.portfolio.type,
                    'portfolio_name': compte.portfolio.name,
                    'is_active': compte.is_active,
                    'created_at': compte.created_at.strftime('%Y-%m-%d %H:%M'),
                    'updated_at': compte.updated_at.strftime('%Y-%m-%d %H:%M'),
                    'last_modified_by': f"{compte.last_modified_by.first_name} {compte.last_modified_by.last_name}" if compte.last_modified_by else None,
                    'last_modification_date': compte.last_modification_date.strftime('%Y-%m-%d %H:%M') if compte.last_modification_date else None,
                })
            
            return Response({
                'success': True,
                'accounts': data,
                'total': len(data)
            })
            
        except Exception as e:
            import traceback
            print(f"ERROR AllMemberAccountsView: {traceback.format_exc()}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BulkUpdateMemberAccountView(APIView):
    """Admin — met à jour un compte membre avec tous les champs."""
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, compte_id):
        try:
            # Vérifier que l'utilisateur est admin
            if not request.user.role or request.user.role.name != 'admin':
                return Response({
                    'success': False,
                    'error': 'Accès réservé aux administrateurs'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Vérifier le mot de passe de l'admin
            password = request.data.get('admin_password')
            if not password:
                return Response({
                    'success': False,
                    'error': 'Mot de passe requis pour valider la modification'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Vérifier le mot de passe
            if not request.user.check_password(password):
                return Response({
                    'success': False,
                    'error': 'Mot de passe incorrect'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            from .models import Compte_member
            from decimal import Decimal
            from django.utils import timezone
            
            # Récupérer le compte
            compte = Compte_member.objects.get(id=compte_id)
            
            data = request.data
            
            # Mettre à jour tous les champs modifiables
            if 'member_external_id' in data:
                compte.member_external_id = data['member_external_id']
            
            if 'balance' in data:
                compte.balance = Decimal(str(data['balance']))
            
            if 'shares_count' in data:
                compte.shares_count = Decimal(str(data['shares_count']))
            
            if 'gross_value' in data:
                compte.gross_value = Decimal(str(data['gross_value']))
            
            if 'promesse_annuelle' in data:
                compte.promesse_annuelle = Decimal(str(data['promesse_annuelle'])) if data['promesse_annuelle'] else None
            
            if 'frais_gestion' in data:
                compte.frais_gestion = Decimal(str(data['frais_gestion'])) if data['frais_gestion'] else None
            
            if 'capital_net' in data:
                compte.capital_net = Decimal(str(data['capital_net'])) if data['capital_net'] else None
            
            if 'parts_pct' in data:
                compte.parts_pct = Decimal(str(data['parts_pct'])) if data['parts_pct'] else None
            
            if 'profit_type' in data:
                compte.profit_type = data['profit_type'] or None
            
            if 'is_active' in data:
                compte.is_active = bool(data['is_active'])
            
            if 'date_entree' in data and data['date_entree']:
                from datetime import datetime
                compte.date_entree = datetime.strptime(data['date_entree'], '%Y-%m-%d').date()
            
            # Enregistrer l'audit trail
            compte.last_modified_by = request.user
            compte.last_modification_date = timezone.now()
            
            compte.save()
            
            return Response({
                'success': True,
                'message': 'Compte mis à jour avec succès',
                'account': {
                    'id': compte.id,
                    'account_number': compte.account_number,
                    'member_external_id': compte.member_external_id or '',
                    'balance': float(compte.balance),
                    'shares_count': float(compte.shares_count),
                    'gross_value': float(compte.gross_value),
                    'promesse_annuelle': float(compte.promesse_annuelle) if compte.promesse_annuelle else 0,
                    'frais_gestion': float(compte.frais_gestion) if compte.frais_gestion else 0,
                    'capital_net': float(compte.capital_net) if compte.capital_net else 0,
                    'parts_pct': float(compte.parts_pct) if compte.parts_pct else 0,
                    'profit_type': compte.profit_type or '',
                    'is_active': compte.is_active,
                    'last_modified_by': f"{request.user.first_name} {request.user.last_name}",
                    'last_modification_date': compte.last_modification_date.strftime('%Y-%m-%d %H:%M'),
                }
            })
            
        except Compte_member.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Compte introuvable'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            print(f"ERROR BulkUpdateMemberAccountView: {traceback.format_exc()}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateSnapshotRowView(APIView):
    """Admin — met à jour une ligne d'actif dans un snapshot."""
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, snapshot_id, row_id):
        try:
            # Vérifier que l'utilisateur est admin
            if not request.user.role or request.user.role.name != 'admin':
                return Response({
                    'success': False,
                    'error': 'Accès réservé aux administrateurs'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Vérifier le mot de passe de l'admin
            password = request.data.get('admin_password')
            if not password:
                return Response({
                    'success': False,
                    'error': 'Mot de passe requis pour valider la modification'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Vérifier le mot de passe
            if not request.user.check_password(password):
                return Response({
                    'success': False,
                    'error': 'Mot de passe incorrect'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            from .models import PortfolioSnapshotRow
            from decimal import Decimal
            
            # Récupérer la ligne
            row = PortfolioSnapshotRow.objects.get(id=row_id, snapshot_id=snapshot_id)
            
            data = request.data
            
            # Mettre à jour tous les champs modifiables
            if 'actif' in data:
                row.actif = data['actif']
            
            if 'poids' in data:
                row.poids = Decimal(str(data['poids']))
            
            if 'quantite' in data:
                row.quantite = Decimal(str(data['quantite']))
            
            if 'cours_achat' in data:
                row.cours_achat = Decimal(str(data['cours_achat']))
            
            if 'cours_cloture' in data:
                row.cours_cloture = Decimal(str(data['cours_cloture']))
            
            if 'dividende' in data:
                row.dividende = Decimal(str(data['dividende']))
            
            if 'rendement_brut' in data:
                row.rendement_brut = Decimal(str(data['rendement_brut']))
            
            if 'investissement' in data:
                row.investissement = Decimal(str(data['investissement']))
            
            if 'valorisation' in data:
                row.valorisation = Decimal(str(data['valorisation']))
            
            if 'rendement_annuel' in data:
                row.rendement_annuel = Decimal(str(data['rendement_annuel']))
            
            if 'variation_semaine' in data:
                row.variation_semaine = Decimal(str(data['variation_semaine']))
            
            row.save()
            
            return Response({
                'success': True,
                'message': 'Actif mis à jour avec succès',
                'row': {
                    'id': row.id,
                    'actif': row.actif,
                    'poids': str(row.poids),
                    'quantite': str(row.quantite),
                    'cours_achat': str(row.cours_achat),
                    'cours_cloture': str(row.cours_cloture),
                    'dividende': str(row.dividende),
                    'rendement_brut': str(row.rendement_brut),
                    'investissement': str(row.investissement),
                    'valorisation': str(row.valorisation),
                    'rendement_annuel': str(row.rendement_annuel),
                    'variation_semaine': str(row.variation_semaine),
                }
            })
            
        except PortfolioSnapshotRow.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Actif introuvable'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            print(f"ERROR UpdateSnapshotRowView: {traceback.format_exc()}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
