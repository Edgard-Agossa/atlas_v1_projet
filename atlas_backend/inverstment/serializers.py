from rest_framework import serializers
from .models import Holding

class HoldingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Holding
        fields = ['id', 'asset', 'symbol', 'name', 'quantity', 'avg_price', 'current_price', 'portfolio', 'sector', 'asset_type', 'last_updated']
        read_only_fields = ['id', 'last_updated']
