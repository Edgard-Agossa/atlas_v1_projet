from django.db import models
from django.contrib.auth import get_user_model

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
    account_number = models.CharField(max_length=50, unique=True)
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='member_accounts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['member', 'portfolio']# Empêche qu'in membre ait plusieurs comptes pour le même portefeuille
        verbose_name = 'Compte Membre'
        verbose_name_plural = 'Comptes Membres'
    
    def __str__(self):
        return f"{self.member.name} - {self.portfolio.name} ({self.account_number})"
    
    def save(self, *args, **kwargs):
        if not self.account_number:
            import uuid
            self.account_number = f"{self.portfolio.type[:3]}-{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)
        
        
        
        
# Modèles pour le système de paiement USDT
class USDTPayment(models.Model):
    PAYMENT_TYPES = [
        ('DEPOSIT', 'Dépôt USDT'),
        ('WITHDRAWAL', 'Retrait USDT'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('CONFIRMED', 'Confirmé'),
        ('FAILED', 'Échoué'),
    ]
    
    NETWORK_CHOICES = [
        ('TRC20', 'USDT Tron (TRC-20)'),
        ('ERC20', 'USDT Ethereum (ERC-20)'),
        ('BEP20', 'USDT BSC (BEP-20)'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='usdt_payments')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES)
    amount_usdt = models.DecimalField(max_digits=20, decimal_places=6)
    network = models.CharField(max_length=10, choices=NETWORK_CHOICES, default='TRC20')
    wallet_address = models.CharField(max_length=100)
    tx_hash = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    portfolio = models.CharField(max_length=20, choices=Transaction.PORTFOLIO_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.payment_type} - {self.amount_usdt} USDT - {self.user.username}"

class USDTWalletConfig(models.Model):
    network = models.CharField(max_length=10, choices=USDTPayment.NETWORK_CHOICES, unique=True)
    deposit_address = models.CharField(max_length=100)
    private_key = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
