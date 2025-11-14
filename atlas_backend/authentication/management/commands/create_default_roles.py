from django.core.management.base import BaseCommand
from authentication.models import Role

class Command(BaseCommand):
    help = 'Créer les rôles par défaut'

    def handle(self, *args, **options):
        Role.objects.get_or_create(name='admin', defaults={'description': 'Administrateur'})
        Role.objects.get_or_create(name='member', defaults={'description': 'Membre'})
        self.stdout.write(self.style.SUCCESS('Rôles créés avec succès'))
