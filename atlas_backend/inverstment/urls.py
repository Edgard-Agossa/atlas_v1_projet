from django.urls import path, include
from . import views

urlpatterns = [
    path('transactions/', views.TransactionListCreateView.as_view(), name='transaction-list'),
    path('portfolios/', views.PortfolioListView.as_view(), name='portfolio-list'),
    path('portfolio/', views.PortfolioView.as_view(), name='portfolio-list'),
    path('members/', views.MemberListView.as_view(), name='member-list'),
    # Utiliser les URLs simplifiées pour les holdings
    path('', include('inverstment.urls_simple')),
    
    #Opération sur les comptes des membres
    path('accounts/deposit/<int:member_id>/',views.DepositView.as_view(), name='account-deposit'),
    path('accounts/withdraw/',views.WithdrawView.as_view(), name='account-withdraw'),
    # Gestion des comptes membres
    path('accounts/member/<int:member_id>/', views.MemberAccountsView.as_view(), name='member-accounts'),
    path('accounts/create/<int:member_id>/', views.CreateMemberAccountsView.as_view(), name='create-member-accounts'),
    #get all transactions
    path('accounts/transactions/all/', views.AllTransactionsView.as_view(), name='all-transactions'),
    path('accounts/create/<int:member_id>/', views.CreateMemberAccountsView.as_view(), name='create-member-accounts'),
    
    # Transactions d'un compte
    path('accounts/<int:compte_id>/transactions/', views.AccountTransactionsView.as_view(), name='account-transactions'),
    #l'url pour les usdt
    path('crypto/payment/init/', views.CryptoPaymentInitView.as_view(), name='crypto-payment-init'),
    path('crypto/payment/verify/', views.CryptoPaymentVerifyView.as_view(), name='crypto-payment-verify'),
    path('crypto/transaction/<str:transaction_id>/', views.CryptoTransactionStatusView.as_view(), name='crypto-transaction-status'),
    path('admin/crypto/transactions/', views.AdminCryptoTransactionsView.as_view(), name='admin-crypto-transactions'),
        # Mobile Money
    path('mobile-money/payment/init/', views.MobileMoneyPaymentInitView.as_view(), name='mobile-money-init'),
    path('mobile-money/webhook/', views.MobileMoneyWebhookView.as_view(), name='mobile-money-webhook'),
    path('mobile-money/transaction/<str:transaction_id>/', views.MobileMoneyStatusView.as_view(), name='mobile-money-status'),
]
