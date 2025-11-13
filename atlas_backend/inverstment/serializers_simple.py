from rest_framework import serializers
from .models import Holding

class HoldingSerializer(serializers.ModelSerializer):
    """Serializer simple qui correspond exactement au modèle Holding"""
    owner_username = serializers.CharField(source='owner.first_name', read_only=True)
    
    class Meta:
        model = Holding
        fields = '__all__'  # Tous les champs du modèle
        read_only_fields = ['id', 'owner', 'owner_username', 'last_updated']
    
    def create(self, validated_data):
        # L'owner sera fourni par la vue via perform_create
        return super().create(validated_data)