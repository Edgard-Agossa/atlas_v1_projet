from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
User = get_user_model()

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('DEPOSIT', 'Dépôt'),
        ('WITHDRAWAL', 'Retrait'),
        ('BUY', 'Achat'),
        ('SELL', 'Vente'),
        ('DIVIDEND', 'Dividende'),
        ('INTEREST', 'Intérêt'),
    ]

    PORTFOLIO_TYPES = [
        ('PHRONESIS', 'Phronesis (Passif)'),
        ('FLAGSHIP', 'FlagShip (Actif)'),
    ]

    type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    date = models.DateField()
    portfolio = models.CharField(max_length=20, choices=PORTFOLIO_TYPES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    asset = models.CharField(max_length=10, blank=True, null=True)  # AAPL, MSFT, etc.
    quantity = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)
    price = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    member_id = models.CharField(max_length=50, blank=True, null=True)
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_transactions')
    receiver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='received_transactions')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.amount}€ - {self.date}"

class Holding(models.Model):
    asset = models.CharField(max_length=10)  # AAPL, MSFT, etc.
    symbol = models.CharField(max_length=10)
    name = models.CharField(max_length=100)
    quantity = models.DecimalField(max_digits=15, decimal_places=4)
    avg_price = models.DecimalField(max_digits=15, decimal_places=2)
    current_price = models.DecimalField(max_digits=15, decimal_places=2)
    portfolio = models.CharField(max_length=20, choices=Transaction.PORTFOLIO_TYPES)
    sector = models.CharField(max_length=50, default='Technology')
    asset_type = models.CharField(max_length=20, default='stock')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='holdings', null=True, blank=True)
    is_public = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.symbol} - {self.quantity} shares"

class Portfolio(models.Model):
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=Transaction.PORTFOLIO_TYPES, unique=True)
    cash = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_portfolios')

    def __str__(self):
        return self.name

class Member(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Actif'),
        ('INACTIVE', 'Inactif'),
        ('SUSPENDED', 'Suspendu'),
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    join_date = models.DateField(auto_now_add=True)
    total_contribution = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    current_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    invested_capital = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    shares = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    profile_type = models.CharField(max_length=50, default='Standard')
    avatar = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name
class Compte_member(models.Model):
    member = models.ForeignKey(User, on_delete=models.CASCADE, related_name='my_account')
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='member_accounts')
    
    # Identifiant unique du fichier (ex: PHR-1)
    member_external_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    
    # Données financières issues de l'Excel
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)       # Montant versé
    shares_count = models.DecimalField(max_digits=15, decimal_places=6, default=0)  # Nbre de part
    gross_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)   # Valeur nette

    # Champs supplémentaires issus de l'Excel
    date_entree = models.DateField(null=True, blank=True)                            # Date d'entrée
    promesse_annuelle = models.DecimalField(max_digits=15, decimal_places=2, default=0, null=True, blank=True)  # Promesse Annuelle
    frais_gestion = models.DecimalField(max_digits=15, decimal_places=2, default=0, null=True, blank=True)      # Frais de gestion
    capital_net = models.DecimalField(max_digits=15, decimal_places=2, default=0, null=True, blank=True)        # Capital investi net (frais déduits)
    parts_pct = models.DecimalField(max_digits=10, decimal_places=4, default=0, null=True, blank=True)          # Parts détenues (%)
    profit_type = models.CharField(max_length=100, blank=True, null=True)            # Profit Type (PHR_Prudent, FLG_Dynamique...)
    
    # Métadonnées
    account_number = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Audit trail - Qui a modifié et quand
    last_modified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='modified_accounts')
    last_modification_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['member', 'portfolio']
        verbose_name = 'Compte Membre'
        verbose_name_plural = 'Comptes Membres'

    def save(self, *args, **kwargs):
        if not self.account_number:
            # On utilise le type de portfolio (PHR/FLG) pour le numéro de compte
            prefix = self.portfolio.type[:3].upper() if self.portfolio else "ACC"
            import uuid
            self.account_number = f"{prefix}-{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)
           
        
# Modèles pour le système de paiement USDT
class USDTPayment(models.Model):
    PAYMENT_TYPES = [
        ('DEPOSIT', 'Dépôt USDT'),
        ('WITHDRAWAL', 'Retrait USDT'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('PAID', 'Payé'),
        ('EXPIRED', 'Expiré'),
        ('FAILED', 'Échoué'),
    ]
    
    NETWORK_CHOICES = [
        ('TRC20', 'USDT Tron (TRC-20)'),
        ('ERC20', 'USDT Ethereum (ERC-20)'),
        ('BEP20', 'USDT BSC (BEP-20)'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='usdt_payments')
    transaction_id = models.CharField(max_length=50, unique=True)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES)
    amount_usdt = models.DecimalField(max_digits=20, decimal_places=6)
    network = models.CharField(max_length=10, choices=NETWORK_CHOICES, default='TRC20')
    wallet_address = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    # Plan d'investissement
    portfolio = models.CharField(max_length=20, choices=Transaction.PORTFOLIO_TYPES)
    is_activated = models.BooleanField(default=False)

     # Détails blockchain
    tx_hash = models.CharField(max_length=100, blank=True, null=True)
    received_amount = models.DecimalField(max_digits=20, decimal_places=6, blank=True, null=True)
    sender_address = models.CharField(max_length=100, blank=True, null=True)
     # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    paid_at = models.DateTimeField(blank=True, null=True)
    def save(self, *args, **kwargs):
        if not self.transaction_id:
            import uuid
            self.transaction_id = f"USDT-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)

        
        
    def __str__(self):
        return f"{self.payment_type} - {self.amount_usdt} USDT - {self.user.username}"
class CryptoWalletConfig(models.Model):
    network = models.CharField(max_length=10, default='TRC20', unique=True)
    wallet_address = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

class BlockchainMonitoring(models.Model):
    last_checked_block = models.BigIntegerField(default=0)
    network = models.CharField(max_length=10, default='TRC20')
    last_check_time = models.DateTimeField(auto_now=True)
class USDTWalletConfig(models.Model):
    network = models.CharField(max_length=10, choices=USDTPayment.NETWORK_CHOICES, unique=True)
    deposit_address = models.CharField(max_length=100)
    private_key = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

# Modèle pour les paiements Mobile Money via Fedapay et leurs retours d'erreur 
# ── Récapitulatif Portfolio (Snapshot CSV) ────────────────────────────────────

class PortfolioSnapshot(models.Model):
    portfolio_name = models.CharField(max_length=100, default='Phronesis')
    semaine = models.CharField(max_length=50, blank=True)
    vnl = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='snapshots')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.portfolio_name} — {self.semaine} ({self.created_at.strftime('%d/%m/%Y')})"


class SnapshotRow(models.Model):
    snapshot = models.ForeignKey(PortfolioSnapshot, on_delete=models.CASCADE, related_name='rows')
    actif = models.CharField(max_length=200)
    poids = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    quantite = models.DecimalField(max_digits=20, decimal_places=4, default=0)
    cours_achat = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    cours_cloture = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    dividende = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    rendement_brut = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    investissement = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    valorisation = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    rendement_annuel = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    variation_semaine = models.DecimalField(max_digits=10, decimal_places=4, default=0)

    def __str__(self):
        return f"{self.actif} — {self.snapshot}"


# ── Ticker d'actifs ───────────────────────────────────────────────────────────

class TickerAsset(models.Model):
    symbol = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    current_price = models.DecimalField(max_digits=20, decimal_places=4, default=0)
    variation_pct = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    currency = models.CharField(max_length=20, default='USD')  # USD, EUR, XOF, EUR/XOF...
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'symbol']

    def __str__(self):
        return f"{self.symbol} — {self.current_price}"


class MobileMoneyPayment(models.Model):
    PAYMENT_METHODS =[
        ('mtn', 'MTN Mobile Money'),
        ('moov', 'Moov Money'),
        ('orange', 'Orange Money'),
        
    ]
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('APPROVED', 'Approuvé'),
        ('DECLINED', 'Refusé'),
        ('CANCELED', 'Annulé'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    transaction_id = models.CharField(max_length=50, unique=True)
    fedapay_transction_id = models.CharField(max_length=100, blank=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=10, default='XOF')
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHODS)
    phone_number = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    portfolio = models.CharField(max_length=20, choices=Transaction.PORTFOLIO_TYPES)
    is_activated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    #Métadonnées FedaPay
    fedapay_reference = models.CharField(max_length=100, blank=True)
    callback_url = models.URLField(blank=True)
    
    def save(self, *args, **kwargs):
        if not self.transaction_id:
            import uuid
            self.transaction_id = f"MM-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)
    