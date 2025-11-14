from ..models import Compte_member, Transaction, Member, Portfolio, Holding
from django.db import transaction
from django.utils import timezone
from authentication.models import User
from decimal import Decimal


class AccountManager:
    @staticmethod  # Un seul @staticmethod
    def deposit(compte_id, amount, description=None, created_by=None):
        """Effectuer un dépôt sur le compte membre"""
        if compte_id is None:
            raise ValueError("L'identifiant du compte ne peut pas être nul.")
        
        if amount <= 0:
            raise ValueError("Le montant du dépôt doit être supérieur à zéro.")
        
        with transaction.atomic():
            compte = Compte_member.objects.select_for_update().get(id=compte_id)
            
            compte.balance += Decimal(str(amount))
            compte.save()
            
            Transaction.objects.create(
                type='DEPOSIT',
                date=timezone.now().date(),
                portfolio=compte.portfolio.type,
                amount=amount,
                member_id=str(compte.member.id),
                sender=created_by,  # L'utilisateur qui fait le dépôt
                receiver=compte.member,  # Le propriétaire du compte,
                description=description or f"Dépôt sur compte {compte.account_number}"
            )
            
            return {
                'success': True,
                'message': f"Dépôt de {amount}€ effectué avec succès",
                'new_balance': float(compte.balance)
            }
        
    @staticmethod 
    def withdraw(compte_id, amount, description=None, created_by=None):
        """Effectuer un retrait sur le compte membre"""
        if compte_id is None:
            raise ValueError("L'identifiant du compte ne peut pas être nul.")
        
        if amount <= 0:
            raise ValueError("Le montant du retrait doit être supérieur à zéro.")
        
        with transaction.atomic():
            compte = Compte_member.objects.select_for_update().get(id=compte_id)
                
            if compte.balance < amount:
                raise ValueError("Fonds insuffisants pour effectuer le retrait.")
                
            old_balance = compte.balance
            compte.balance -= Decimal(str(amount))
            compte.save()
                
            Transaction.objects.create(
                type='WITHDRAWAL',  # Corrigé
                date=timezone.now().date(),  # Ajouté .date()
                portfolio=compte.portfolio.type,
                amount=amount,
                member_id=str(compte.member.id),
                sender=compte.member,  # Le propriétaire du compte qui retire
                receiver=created_by,   # L'utilisateur qui reçoit l'argent
                description=description or f"Retrait du compte {compte.account_number}"
            )
            
            return {
                'success': True,
                'message': f"Retrait de {amount}€ effectué avec succès.",
                'details': {
                    'member_name': f"{compte.member.first_name} {compte.member.last_name}",  
                    'account_number': compte.account_number,
                    'portfolio': compte.portfolio.name,
                    'amount_withdrawn': amount,
                    'old_balance': float(old_balance),
                    'new_balance': float(compte.balance),
                    'transaction_date': timezone.now().date().strftime('%d/%m/%Y')
                }
            }
            
            
        
    @staticmethod
    def get_member_accounts(member_id):
        """Récupérer tous les comptes d'un membre donné."""
        if member_id is None:
            raise ValueError("L'identifiant du membre ne peut pas être nul.")
        
        return Compte_member.objects.filter(
            member__id=member_id,
            is_active=True
        ).select_related('portfolio', 'member')
        
    @staticmethod
    def creat_member_account(member_id):
        
        """créer automatiquement les comptes d'un membre pour tous les portfolios"""
        if member_id is None:
            raise ValueError("L'identifiant du membre ne peut pas être nul.")
        try: 
            member_id = int(member_id)
            user = User.objects.get(id=member_id)
        except (ValueError, TypeError):
            raise ValueError("L'identifiant du membre doit être un nombre.")
        except User.DoesNotExist:
            raise ValueError("Utilisateur non trouvé.")
           
        
                
        portfolios = Portfolio.objects.all()
        
        created_accounts = []
        for portfolio in portfolios:
            compte , created = Compte_member.objects.get_or_create(
                member=user,
                portfolio=portfolio,
                defaults={'balance': 0}
            )
            if created:
                created_accounts.append(compte)
            #Retourner message et données
        if created_accounts:
            return {
                'success': True,
                'message': f"{len(created_accounts)} comptes créés pour {user.first_name} {user.last_name}",
                'created_accounts': created_accounts,
                'count': len(created_accounts)
            }
        else:
            return {
                'success': False,
                'message': f"Aucun nouveau compte créé pour {user.first_name} {user.last_name}.",
                'created_accounts': [],
                'count': 0
            }

    
    @staticmethod
    def get_account_transactions(compte_id, limit=None):
        """Récupérer les transactions d'un compte"""
        
        if compte_id is None:
            raise ValueError("L'identifiant du compte ne peut pas être nul.")
        
        compte = Compte_member.objects.get(id=compte_id)
        transactions = Transaction.objects.filter(
            member_id=str(compte.member.id),
            portfolio=compte.portfolio.type
        ).order_by('-created_at')
        
        if limit:
            transactions = transactions[:limit]
        
        return transactions   