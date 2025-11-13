from django.urls import path
from .views_simple import HoldingListCreateView, HoldingDetailView

urlpatterns = [
    # API Holdings simplifiée
    path('holdings/', HoldingListCreateView.as_view(), name='holdings-list-create'),
    path('holdings/<int:pk>/', HoldingDetailView.as_view(), name='holdings-detail'),
]