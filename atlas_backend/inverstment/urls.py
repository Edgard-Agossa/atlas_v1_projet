from django.urls import path, include
from . import views

urlpatterns = [
    path('transactions/', views.TransactionListCreateView.as_view(), name='transaction-list'),
    path('portfolios/', views.PortfolioListView.as_view(), name='portfolio-list'),
    path('members/', views.MemberListView.as_view(), name='member-list'),
    # Utiliser les URLs simplifiées pour les holdings
    path('', include('inverstment.urls_simple')),
]
