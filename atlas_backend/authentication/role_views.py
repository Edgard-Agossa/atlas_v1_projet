from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Role, User


class RoleListCreateView(APIView):
    """Liste tous les rôles ou crée un nouveau rôle (admin only)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        roles = Role.objects.all().order_by('name')
        data = [{
            'id': r.id,
            'name': r.name,
            'description': r.description,
            'users_count': r.user_set.count(),
        } for r in roles]
        return Response({'roles': data, 'total': len(data)})

    def post(self, request):
        if not request.user.role or request.user.role.name != 'admin':
            return Response({'error': 'Accès réservé aux administrateurs.'},
                            status=status.HTTP_403_FORBIDDEN)

        name = request.data.get('name', '').strip()
        description = request.data.get('description', '').strip()

        if not name:
            return Response({'error': 'Le nom du rôle est requis.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if Role.objects.filter(name=name).exists():
            return Response({'error': 'Ce rôle existe déjà.'},
                            status=status.HTTP_400_BAD_REQUEST)

        role = Role.objects.create(name=name, description=description)
        return Response({
            'success': True,
            'role': {
                'id': role.id,
                'name': role.name,
                'description': role.description,
            }
        }, status=status.HTTP_201_CREATED)


class RoleDetailView(APIView):
    """Modifie ou supprime un rôle (admin only)."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, role_id):
        if not request.user.role or request.user.role.name != 'admin':
            return Response({'error': 'Accès réservé aux administrateurs.'},
                            status=status.HTTP_403_FORBIDDEN)
        try:
            role = Role.objects.get(id=role_id)
            if 'name' in request.data:
                role.name = request.data['name'].strip()
            if 'description' in request.data:
                role.description = request.data['description'].strip()
            role.save()
            return Response({
                'success': True,
                'role': {'id': role.id, 'name': role.name, 'description': role.description}
            })
        except Role.DoesNotExist:
            return Response({'error': 'Rôle introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, role_id):
        if not request.user.role or request.user.role.name != 'admin':
            return Response({'error': 'Accès réservé aux administrateurs.'},
                            status=status.HTTP_403_FORBIDDEN)
        try:
            role = Role.objects.get(id=role_id)
            # Empêcher la suppression des rôles système
            if role.name in ('admin', 'member'):
                return Response({'error': 'Impossible de supprimer un rôle système.'},
                                status=status.HTTP_400_BAD_REQUEST)
            # Vérifier qu'aucun utilisateur n'a ce rôle
            if role.user_set.exists():
                return Response({'error': f'{role.user_set.count()} utilisateur(s) ont ce rôle. Réassignez-les avant de supprimer.'},
                                status=status.HTTP_400_BAD_REQUEST)
            role.delete()
            return Response({'success': True, 'message': 'Rôle supprimé.'})
        except Role.DoesNotExist:
            return Response({'error': 'Rôle introuvable.'}, status=status.HTTP_404_NOT_FOUND)


class AssignRoleView(APIView):
    """Assigne un rôle à un utilisateur (admin only)."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.role or request.user.role.name != 'admin':
            return Response({'error': 'Accès réservé aux administrateurs.'},
                            status=status.HTTP_403_FORBIDDEN)

        user_id = request.data.get('user_id')
        role_id = request.data.get('role_id')

        if not user_id or not role_id:
            return Response({'error': 'user_id et role_id requis.'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id)
            role = Role.objects.get(id=role_id)
            user.role = role
            user.save()
            return Response({
                'success': True,
                'message': f'Rôle "{role.name}" assigné à {user.full_name}.',
                'user': {
                    'id': user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': role.name,
                }
            })
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        except Role.DoesNotExist:
            return Response({'error': 'Rôle introuvable.'}, status=status.HTTP_404_NOT_FOUND)
