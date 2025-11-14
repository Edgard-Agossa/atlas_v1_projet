from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from ..models import User

@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return JsonResponse({
                'success': False,
                'message': 'Email et mot de passe requis'
            }, status=400)
        
        user = User.authenticate(email, password)
        
        if user:
            # Mettre à jour last_login
            from django.utils import timezone
            user.last_login = timezone.now()
            user.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Connexion réussie',
                'user': {
                    'id': user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                    'role': user.role.name if user.role else None,
                    'avatar': user.avatar,
                    'total_contribution': float(user.total_contribution),
                    'current_balance': float(user.current_balance),
                    'invested_capital': float(user.invested_capital),
                    'shares': user.shares,
                    'profile_type': user.profile_type,
                    'join_date': user.join_date.isoformat()
                }
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Email ou mot de passe incorrect'
            }, status=401)
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Données JSON invalides'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': 'Erreur serveur'
        }, status=500)
