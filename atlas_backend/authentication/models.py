from django.db import models
from django.contrib.auth.hashers import make_password, check_password

    
class User(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.URLField(blank=True, null=True)
    role = models.CharField(
        max_length=10, 
        choices=[('admin', 'Admin'), ('member', 'Member')], 
        default='member'
    )
    
    # Statut
    is_active = models.BooleanField(default=True)
    profile_type = models.CharField(max_length=20, default='Standard')
    
    # Métadonnées
    join_date = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-join_date']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    # Méthodes pour gérer les mots de passe
    def set_password(self, raw_password):
        self.password = make_password(raw_password)
    
    def check_password(self, raw_password):
        return check_password(raw_password, self.password)
    
    # Méthode pour l'authentification
    @classmethod
    def authenticate(cls, email, password):
        try:
            user = cls.objects.get(email=email, is_active=True)
            if user.check_password(password):
                return user
        except cls.DoesNotExist:
            pass
        return None