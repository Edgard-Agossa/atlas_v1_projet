from rest_framework import serializers
from .models import Holding

class HoldingSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    portfolio_name = serializers.CharField(source='portfolio.name', read_only=True)

    class Meta:
        model = Holding
        fields = [
            'id', 'asset', 'symbol', 'name', 'quantity', 'avg_price',
            'current_price', 'portfolio', 'sector', 'asset_type',
            'owner', 'owner_username', 'portfolio_name', 'is_public', 'last_updated'
        ]
        read_only_fields = ['id', 'owner_username', 'portfolio_name', 'last_updated']

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
