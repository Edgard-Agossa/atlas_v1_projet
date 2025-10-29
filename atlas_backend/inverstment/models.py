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
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.symbol} - {self.quantity} shares"

class Portfolio(models.Model):
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=Transaction.PORTFOLIO_TYPES, unique=True)
    cash = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)

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
