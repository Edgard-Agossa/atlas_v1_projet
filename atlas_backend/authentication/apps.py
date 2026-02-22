from django.apps import AppConfig

class AuthenticationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authentication'

    def ready(self):
        from authentication.models import Role
        from django.db.utils import OperationalError, ProgrammingError
        
        try:
            Role.objects.get_or_create(name='admin', defaults={'description': 'Administrateur'})
            Role.objects.get_or_create(name='member', defaults={'description': 'Membre'})
        except (OperationalError, ProgrammingError):
            pass
