from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Holding, Portfolio
from .serializers import HoldingSerializer

User = get_user_model()

class HoldingListCreateView(generics.ListCreateAPIView):
    serializer_class = HoldingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Si admin, voir tous les holdings, sinon seulement les siens ou les publics
        if user.is_staff:
            return Holding.objects.all()
        return Holding.objects.filter(owner=user) | Holding.objects.filter(is_public=True)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class HoldingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = HoldingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Si admin, voir tous les holdings, sinon seulement les siens ou les publics
        if user.is_staff:
            return Holding.objects.all()
        return Holding.objects.filter(owner=user) | Holding.objects.filter(is_public=True)

class HoldingTogglePublicView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            holding = Holding.objects.get(pk=pk)
            # Vérifier que l'utilisateur est propriétaire ou admin
            if not request.user.is_staff and holding.owner != request.user:
                return Response(
                    {'error': 'Vous n\'avez pas la permission de modifier ce holding'},
                    status=status.HTTP_403_FORBIDDEN
                )

            holding.is_public = not holding.is_public
            holding.save()

            return Response({
                'message': f'Holding rendu {"public" if holding.is_public else "privé"}',
                'is_public': holding.is_public
            })
        except Holding.DoesNotExist:
            return Response(
                {'error': 'Holding non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
