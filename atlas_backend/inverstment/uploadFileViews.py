import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Compte_member, Portfolio
from rest_framework.permissions import IsAuthenticated


User = get_user_model()

class AssetUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
  
        file = request.FILES.get('file')
        
        target_sheet = request.data.get('sheet_name', 'Table_Membre')
        ALLOWED_SHEETS = ['Table_Membre', 'Portfolio', 'Transactions']
        
        if target_sheet not in ALLOWED_SHEETS:
            return Response({"error": f"L'onglet '{target_sheet}' n'est pas autorisé"}, status=400)
        if not file:
            return Response({"error": "Fichier manquant"}, status=400)

        try:
            # Lecture du fichier Excel
            df = pd.read_excel(file, sheet_name=target_sheet)
            df = df.dropna(how='all')
            data_list = []

            for _, row in df.iterrows():
                if target_sheet == 'Table_Membre':
                    user_email = row.get('Email')
                    # On définit le mot de passe par défaut (depuis Excel ou 123123)
                    default_password = str(row.get('Password', '123123'))
                    external_id = str(row.get('ID membre', ''))

                    if pd.notna(user_email) and user_email != "":
                        # 1. Détermination du type de portfolio
                        if "PHR" in external_id.upper():
                            portfolio_type = "PHR"
                        elif "FLG" in external_id.upper():
                            portfolio_type = "FLG"
                        else:
                            continue 

                        # 2. Gestion de l'utilisateur (Création ou Récupération)
                        # On ne met pas le password dans defaults car il ne serait pas haché
                        user, user_created = User.objects.get_or_create(
                            email=user_email,
                            defaults={
                                'first_name': row.get('Nom & prénom', ''),
                                'is_active': True
                            }
                        )

                        # Si l'utilisateur vient d'être créé, on lui donne son mot de passe
                        if user_created:
                            user.set_password(default_password) # Hachage sécurisé Django
                            user.save()

                        # 3. Récupération du Portfolio (doit exister en base)
                        try:
                            portfolio_obj = Portfolio.objects.get(type=portfolio_type)
                        except Portfolio.DoesNotExist:
                            # Option de secours : créer le portfolio s'il manque
                            portfolio_obj = Portfolio.objects.create(
                                type=portfolio_type, 
                                name=f"Portfolio {portfolio_type}"
                            )

                        # 4. Enregistrement / Mise à jour du compte membre
                        # La clé unique est le couple (member, portfolio)
                        compte, account_created = Compte_member.objects.update_or_create(
                            member=user,
                            portfolio=portfolio_obj, 
                            defaults={
                                'member_external_id': external_id,
                                'balance': float(row.get('Montant versé', 0)),
                                'shares_count': float(row.get('Nbre de part', 0)),
                                'gross_value': float(row.get('Valeur Brute', 0)),
                                'is_active': True if str(row.get('Statut Portfolio')).strip() == 'Actif' else False
                            }
                        )

                        data_list.append({
                            "email": user_email,
                            "portfolio": portfolio_type,
                            "user_status": "Created" if user_created else "Existing",
                            "account_status": "Created" if account_created else "Updated"
                        })

            return Response({
                "status": "success",
                "processed_count": len(data_list),
                "details": data_list
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Erreur d'import : {str(e)}")
            return Response({"error": str(e)}, status=500)