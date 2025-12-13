import fedapay
from django.conf import settings
from decimal import Decimal 
from ..models import MobileMoneyPayment
from ..account_manager.account import AccountManager
from datetime import timedelta

class FedaPayService:
    def _init__(self):
        fedapay.api_key = settings.FEDAPAY_CONFIG['SECRET_KEY']
        fedapay.environment = settings.FEDAPAY_CONFIG['ENVIRONMENT']
        
    def create_transaction(self, user, amount, phone_number, payment_method, portfolio):
        """créer une transaction Mobile Money"""
        print(f"DEBUG: Création transaction pour {user.email}")
        print(f"DEBUG: Montant: {amount}, Téléphone: {phone_number}")
        try:
            #Créer l'enregistrement local
            payment = MobileMoneyPayment.objects.create(
                user=user,
                amount=float(amount),
                phone_number=phone_number,
                payment_method=payment_method,
                portfolio=portfolio,
                callback_url="http://127.0.0.1:8000/api/investment/mobile-money/webhook/"
                
            )
            print(f"DEBUG: Payment créé avec ID: {payment.transaction_id}")
            #Créer la transaction FedaPay
            
            transaction = fedapay.Transaction.create({
                "description": f"Dépôt {portfolio}-{payment.transaction_id}",
                "amount": int(Decimal(amount) * 100),  # Montant en centimes
                "currency": {"iso": "XOF"},
                "callback_url": payment.callback_url,
                "customer": {
                    "firstname": user.first_name,
                    "lastname": user.last_name,
                    "email": user.email,
                    "phone_number": {
                        "number": phone_number,
                        "country": "bj"  # Bénin
                    }
                }
                
            })
            
            #Mettre à jour à jour avec l'ID Fedapay
            payment.fedapay_transaction_id = transaction.id
            payment.fedapay_reference = transaction.reference
            payment.save()
            
            #Générer le token de paiement Mobile Money
            token = transaction.generateToken()
            return {
                'sucess':True,
                'transaction_id': payment.transation_id,
                'fedapay_token': token.token,
                'payment_url': token.url,
                'amount': str(amount),
                'phone_number': phone_number,
                'expires_at': payment.created_at + timedelta(minutes=15),
                'payment_method': payment_method,
                'portfolio': portfolio,
                'callback_url': payment.callback_url,
                'fedapay_reference': transaction.reference,
                'fedapay_transaction_id': transaction.id,
                'message': 'Transaction créée avec succès'
                }
        except Exception as  model_error: 
            print(f"DEBUG: Erreur création modèle: {str(model_error)}")
            return {
                'success': False,
                'message': str(model_error)
            }
            
def verify_transaction(self, transction_id):
    """Vérifier le statut de la transaction Mobile Money"""
    try:
        payment = MobileMoneyPayment.objects.get(transction_id=transction_id)
        
        #Récupérer depuis FedaPay
        fedapay_transaction = fedapay.Transaction.retrieve(payment.fedapay_transaction_id)
        
        #Mettre à jour le statut
        payment.status = fedapay_transaction.status.upper()
        payment.save()
        
        #Si approuvé, créditer le compte
        if payment.status == 'APPROVED':
            self.process_successful_payment(payment)
            return{
                'sucess': True,
                'status': payment.status,
                'transaction':fedapay_transaction
            }
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }
        
def process_successful_payment(self, payment):
    """Traiter le paiement réussi"""
    try:
        #Créditer le compte utilisateur
        AccountManager.deposit(
            compte_id=None,
            amount=float(payment.amount),
            member_id=payment.user.id,
            portfolio=payment.portfolio,
            description=f"Dépôt Mobile Money - {payment.transaction_id}"
        )
        print(f"Paiement {payment.transaction_id} traité avec succès")
            
    except Exception as e:
            print(f"Erreur traitement paiement: {e}")

# Instance globale
fedapay_service = FedaPayService()