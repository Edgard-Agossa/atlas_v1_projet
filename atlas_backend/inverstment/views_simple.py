from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Holding
from .serializers_simple import HoldingSerializer

class HoldingListCreateView(generics.ListCreateAPIView):
    """
    Vue simple pour :
    - GET /api/investment/holdings/ : Lister tous les actifs
    - POST /api/investment/holdings/ : Créer un nouvel actif
    """
    queryset = Holding.objects.all()
    serializer_class = HoldingSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        """Définir automatiquement l'owner lors de la création"""
        serializer.save(owner=self.request.user)

    def create(self, request, *args, **kwargs):
        """Créer un nouvel actif avec validation"""
        print("Données reçues:", request.data)  # Debug
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            holding = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Erreurs de validation:", serializer.errors)  # Debug
            
            # Traduire les erreurs en français
            french_errors = {}
            for field, errors in serializer.errors.items():
                field_name = {
                    'asset': 'Asset',
                    'symbol': 'Symbole', 
                    'name': 'Nom',
                    'quantity': 'Quantité',
                    'avg_price': 'Prix moyen',
                    'current_price': 'Prix actuel',
                    'sector': 'Secteur',
                    'asset_type': 'Type d\'actif',
                    'portfolio': 'Portefeuille'
                }.get(field, field)
                
                translated_errors = []
                for error in errors:
                    if 'no more than 10 characters' in str(error):
                        translated_errors.append(f'{field_name}: Maximum 10 caractères autorisés')
                    elif 'This field is required' in str(error):
                        translated_errors.append(f'{field_name}: Ce champ est obligatoire')
                    elif 'valid number' in str(error):
                        translated_errors.append(f'{field_name}: Doit être un nombre valide')
                    else:
                        translated_errors.append(f'{field_name}: {error}')
                
                french_errors[field] = translated_errors
            
            return Response(french_errors, status=status.HTTP_400_BAD_REQUEST)

class HoldingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue simple pour :
    - GET /api/investment/holdings/{id}/ : Voir un actif
    - PUT/PATCH /api/investment/holdings/{id}/ : Modifier un actif  
    - DELETE /api/investment/holdings/{id}/ : Supprimer un actif
    """
    queryset = Holding.objects.all()
    serializer_class = HoldingSerializer
    permission_classes = [IsAuthenticated]