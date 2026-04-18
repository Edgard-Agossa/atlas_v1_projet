from django.urls import path, include
from . import views
from .uploadFileViews import AssetUploadView, ExcelSheetsView
from .ticker_views import TickerListView, TickerDetailView, TickerSyncView
from .snapshot_views import (
    PortfolioSnapshotUploadView,
    PortfolioSnapshotListView,
    PortfolioSnapshotDetailView,
)

urlpatterns = [
    path('transactions/', views.TransactionListCreateView.as_view(), name='transaction-list'),
    path('portfolios/', views.PortfolioListView.as_view(), name='portfolio-list'),
    path('portfolio/', views.PortfolioView.as_view(), name='portfolio-list'),
    path('portfolio/<int:portfolio_id>/', views.PortfolioDetailView.as_view(), name='portfolio-detail'),
    path('members/', views.MemberListView.as_view(), name='member-list'),
    path('', include('inverstment.urls_simple')),

    # Comptes membres
    path('accounts/deposit/<int:member_id>/', views.DepositView.as_view(), name='account-deposit'),
    path('accounts/withdraw/', views.WithdrawView.as_view(), name='account-withdraw'),
    path('accounts/member/<int:member_id>/', views.MemberAccountsView.as_view(), name='member-accounts'),
    path('accounts/create/<int:member_id>/', views.CreateMemberAccountsView.as_view(), name='create-member-accounts'),
    path('accounts/transactions/all/', views.AllTransactionsView.as_view(), name='all-transactions'),
    path('accounts/<int:compte_id>/transactions/', views.AccountTransactionsView.as_view(), name='account-transactions'),
    path('accounts/<int:compte_id>/toggle-active/', views.ToggleAccountActiveView.as_view(), name='account-toggle-active'),
    path('accounts/<int:compte_id>/update/', views.UpdateMemberAccountView.as_view(), name='account-update'),

    # Crypto USDT
    path('crypto/payment/init/', views.CryptoPaymentInitView.as_view(), name='crypto-payment-init'),
    path('crypto/payment/verify/', views.CryptoPaymentVerifyView.as_view(), name='crypto-payment-verify'),
    path('crypto/transaction/<str:transaction_id>/', views.CryptoTransactionStatusView.as_view(), name='crypto-transaction-status'),
    path('admin/crypto/transactions/', views.AdminCryptoTransactionsView.as_view(), name='admin-crypto-transactions'),

    # Mobile Money
    path('mobile-money/payment/init/', views.MobileMoneyPaymentInitView.as_view(), name='mobile-money-init'),
    path('mobile-money/webhook/', views.MobileMoneyWebhookView.as_view(), name='mobile-money-webhook'),
    path('mobile-money/transaction/<str:transaction_id>/', views.MobileMoneyStatusView.as_view(), name='mobile-money-status'),

    # Investissements membres
    path('member/investments/', views.MemberInvestmentsView.as_view(), name='member-investments'),

    # Upload Excel membres
    path('upload-assets/', AssetUploadView.as_view(), name='upload-assets'),
    path('upload-assets/sheets/', ExcelSheetsView.as_view(), name='upload-sheets'),

    # Ticker d'actifs
    path('ticker/', TickerListView.as_view(), name='ticker-list'),
    path('ticker/<int:asset_id>/', TickerDetailView.as_view(), name='ticker-detail'),
    path('ticker/sync/', TickerSyncView.as_view(), name='ticker-sync'),

    # Récapitulatif Portfolio (Snapshots CSV)
    path('snapshots/', PortfolioSnapshotListView.as_view(), name='snapshot-list'),
    path('snapshots/upload/', PortfolioSnapshotUploadView.as_view(), name='snapshot-upload'),
    path('snapshots/<int:snapshot_id>/', PortfolioSnapshotDetailView.as_view(), name='snapshot-detail'),
]
