import requests
from decimal import Decimal
from django.conf import settings
from ..models import USDTPayment, USDTWalletConfig

class USDTService:
    def __init__(self):
        self.tron_api_url = "https://api.trongrid.io"
        self.usdt_contract = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
        # Adresse de réception pour votre business (à remplacer)
        self.business_wallet = "VOTRE_ADRESSE_TRON_ICI"
    
    def get_usdt_balance(self, address):
        """Récupère le VRAI solde USDT via TronScan API"""
        try:
            # API TronScan plus fiable pour les soldes réels
            url = f"https://apilist.tronscanapi.com/api/account/tokens"
            params = {
                'address': address,
                'start': 0,
                'limit': 20,
                'hidden': 0
            }
            
            response = requests.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                
                # Chercher USDT dans les tokens
                for token in data.get('data', []):
                    if token.get('tokenId') == self.usdt_contract:
                        balance_raw = token.get('balance', '0')
                        # Convertir (USDT a 6 décimales)
                        return Decimal(balance_raw) / Decimal('1000000')
                
                return Decimal('0')
            return Decimal('0')
        except Exception as e:
            print(f"Balance error: {e}")
            return Decimal('0')
    
    def check_transaction(self, tx_hash):
        """Vérifie une transaction USDT via TronScan"""
        try:
            url = f"https://apilist.tronscanapi.com/api/transaction-info"
            params = {'hash': tx_hash}
            response = requests.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                # Vérifier que c'est une transaction USDT réussie
                if data.get('contractRet') == 'SUCCESS':
                    # Vérifier que c'est bien un transfert USDT
                    for log in data.get('log', []):
                        if log.get('address') == self.usdt_contract:
                            return True
                return False
            return False
        except Exception as e:
            print(f"Transaction check error: {e}")
            return False
    
    def get_transaction_details(self, tx_hash):
        """Récupère les détails d'une transaction USDT"""
        try:
            url = f"https://apilist.tronscanapi.com/api/transaction-info"
            params = {'hash': tx_hash}
            response = requests.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                
                # Extraire les détails de la transaction USDT
                for log in data.get('log', []):
                    if log.get('address') == self.usdt_contract:
                        topics = log.get('topics', [])
                        if len(topics) >= 3:
                            # Décoder from/to/amount
                            from_addr = '41' + topics[1][-40:]
                            to_addr = '41' + topics[2][-40:]
                            amount_hex = log.get('data', '0')
                            amount = int(amount_hex, 16) / 1000000  # Convertir en USDT
                            
                            return {
                                'from': from_addr,
                                'to': to_addr,
                                'amount': amount,
                                'success': data.get('contractRet') == 'SUCCESS'
                            }
                return None
            return None
        except Exception as e:
            print(f"Transaction details error: {e}")
            return None

    def generate_payment_address(self, user_id):
        """Génère une adresse unique pour un utilisateur (simulation)"""
        # En production, vous devriez générer de vraies adresses TRON
        import hashlib
        hash_input = f"{user_id}_{self.business_wallet}"
        return f"T{hashlib.md5(hash_input.encode()).hexdigest()[:32]}"

usdt_service = USDTService()