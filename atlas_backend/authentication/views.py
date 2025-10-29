from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import permission_classes
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import User

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        required_fields = ['first_name', 'last_name', 'email', 'password']

        # Validation des champs requis
        for field in required_fields:
            if field not in data or not data[field]:
                return Response({
                    'error': f'Le champ {field} est requis'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Vérifier si l'email existe déjà
        if User.objects.filter(email=data['email']).exists():
            return Response({
                'error': 'Cet email est déjà utilisé'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Créer l'utilisateur
        try:
            user = User.objects.create(
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email'],
                password=make_password(data['password']),
                phone=data.get('phone'),
                role=data.get('role', 'member')
            )

            return Response({
                'message': 'Utilisateur créé avec succès',
                'user': {
                    'id': user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                    'role': user.role,
                    'join_date': user.join_date
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'error': f'Erreur lors de la création: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data

        if 'email' not in data or 'password' not in data:
            return Response({
                'error': 'Email et mot de passe requis'
            }, status=status.HTTP_400_BAD_REQUEST)

        user = User.authenticate(data['email'], data['password'])

        if user:
            # Mettre à jour last_login
            user.last_login = timezone.now()
            user.save()

            return Response({
                'message': 'Connexion réussie',
                'user': {
                    'id': user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                    'role': user.role,
                    'avatar': user.avatar,
                    'join_date': user.join_date
                }
            }, status=status.HTTP_200_OK)

        return Response({
            'error': 'Identifiants invalides'
        }, status=status.HTTP_401_UNAUTHORIZED)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'phone': user.phone,
            'avatar': user.avatar,
            'role': user.role,
            'join_date': user.join_date,
            'last_login': user.last_login
        })

    def put(self, request):
        user = request.user
        data = request.data

        # Champs modifiables
        updatable_fields = ['first_name', 'last_name', 'phone', 'avatar']

        for field in updatable_fields:
            if field in data:
                setattr(user, field, data[field])

        try:
            user.save()
            return Response({
                'message': 'Profil mis à jour avec succès',
                'user': {
                    'id': user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                    'phone': user.phone,
                    'avatar': user.avatar,
                    'role': user.role
                }
            })
        except Exception as e:
            return Response({
                'error': f'Erreur lors de la mise à jour: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Vérifier si l'utilisateur est admin
        if request.user.role != 'admin':
            return Response({
                'error': 'Accès non autorisé. Rôle admin requis.'
            }, status=status.HTTP_403_FORBIDDEN)

        users = User.objects.all().order_by('-join_date')
        user_data = []

        for user in users:
            user_data.append({
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'phone': user.phone,
                'avatar': user.avatar,
                'role': user.role,
                'is_active': user.is_active,
                'join_date': user.join_date,
                'last_login': user.last_login
            })

        return Response({
            'users': user_data,
            'total': len(user_data)
        })

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        # Vérifier si l'utilisateur est admin
        if request.user.role != 'admin':
            return Response({
                'error': 'Accès non autorisé. Rôle admin requis.'
            }, status=status.HTTP_403_FORBIDDEN)

        user = get_object_or_404(User, id=user_id)

        return Response({
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'phone': user.phone,
            'avatar': user.avatar,
            'role': user.role,
            'is_active': user.is_active,
            'join_date': user.join_date,
            'last_login': user.last_login
        })

    def put(self, request, user_id):
        # Vérifier si l'utilisateur est admin
        if request.user.role != 'admin':
            return Response({
                'error': 'Accès non autorisé. Rôle admin requis.'
            }, status=status.HTTP_403_FORBIDDEN)

        user = get_object_or_404(User, id=user_id)
        data = request.data

        # Champs modifiables par admin
        admin_updatable_fields = ['first_name', 'last_name', 'email', 'phone', 'avatar', 'role', 'is_active']

        for field in admin_updatable_fields:
            if field in data:
                if field == 'role' and data[field] not in ['admin', 'member']:
                    return Response({
                        'error': 'Rôle invalide. Valeurs possibles: admin, member'
                    }, status=status.HTTP_400_BAD_REQUEST)
                setattr(user, field, data[field])

        try:
            user.save()
            return Response({
                'message': 'Utilisateur mis à jour avec succès',
                'user': {
                    'id': user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                    'phone': user.phone,
                    'avatar': user.avatar,
                    'role': user.role,
                    'is_active': user.is_active
                }
            })
        except Exception as e:
            return Response({
                'error': f'Erreur lors de la mise à jour: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, user_id):
        # Vérifier si l'utilisateur est admin
        if request.user.role != 'admin':
            return Response({
                'error': 'Accès non autorisé. Rôle admin requis.'
            }, status=status.HTTP_403_FORBIDDEN)

        user = get_object_or_404(User, id=user_id)

        # Empêcher la suppression de son propre compte
        if user.id == request.user.id:
            return Response({
                'error': 'Vous ne pouvez pas supprimer votre propre compte'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user.delete()
            return Response({
                'message': 'Utilisateur supprimé avec succès'
            })
        except Exception as e:
            return Response({
                'error': f'Erreur lors de la suppression: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
