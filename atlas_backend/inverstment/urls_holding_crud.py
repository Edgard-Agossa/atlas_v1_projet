from django.urls import path
from .views_holding_crud import (
    HoldingListCreateView,
    HoldingDetailView,
    HoldingTogglePublicView
)

urlpatterns = [
    path('holdings/', HoldingListCreateView.as_view(), name='holding-list-create'),
    path('holdings/<int:pk>/', HoldingDetailView.as_view(), name='holding-detail'),
    path('holdings/<int:pk>/toggle-public/', HoldingTogglePublicView.as_view(), name='holding-toggle-public'),
]
