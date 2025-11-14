from django.urls import path, include
from . import views

urlpatterns = [
    path('transactions/', views.TransactionListCreateView.as_view(), name='transaction-list'),
    path('portfolios/', views.PortfolioListView.as_view(), name='portfolio-list'),
    path('members/', views.MemberListView.as_view(), name='member-list'),
    # Utiliser les URLs simplifiées pour les holdings
    path('', include('inverstment.urls_simple')),
    
    #Opération sur les comptes des membres
    path('accounts/deposit/',views.DepositView.as_view(), name='account-deposit'),
    path('accounts/withdraw/',views.WithdrawView.as_view(), name='account-withdraw'),
    # Gestion des comptes membres
    path('accounts/member/<int:member_id>/', views.MemberAccountsView.as_view(), name='member-accounts'),
    path('accounts/create/<int:member_id>/', views.CreateMemberAccountsView.as_view(), name='create-member-accounts'),
    
    # Transactions d'un compte
    path('accounts/<int:compte_id>/transactions/', views.AccountTransactionsView.as_view(), name='account-transactions'),
]
