import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Compte_member, Portfolio
from rest_framework.permissions import IsAuthenticated

User = get_user_model()

# Onglets reconnus et leur logique de traitement
ALLOWED_SHEETS = ['Table_Membre', 'Portfolio', 'Transactions', 'Membres']


def _get_col(row, *names, default=0):
    """Cherche une valeur dans une ligne en testant plusieurs noms de colonnes possibles."""
    for name in names:
        val = row.get(name)
        if val is not None and str(val).strip() not in ('', 'nan', 'NaN', 'None', '-', '#N/A'):
            try:
                # Nettoyer : espaces, virgules comme séparateur décimal, symboles monétaires
                cleaned = str(val).replace(' ', '').replace('\xa0', '').replace(',', '.').replace('CFA', '').replace('FCFA', '').strip()
                return float(cleaned)
            except (ValueError, TypeError):
                continue
    return default


class ExcelSheetsView(APIView):
    """Retourne la liste des onglets et colonnes disponibles dans un fichier Excel."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "Fichier manquant"}, status=400)
        try:
            xl = pd.ExcelFile(file)
            sheets_info = {}
            for sheet in xl.sheet_names:
                try:
                    df = pd.read_excel(file, sheet_name=sheet, nrows=2)
                    sheets_info[sheet] = list(df.columns)
                except Exception:
                    sheets_info[sheet] = []
            return Response({
                "sheets": xl.sheet_names,
                "sheets_columns": sheets_info,
                "allowed_sheets": ALLOWED_SHEETS,
            })
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class AssetUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "Fichier manquant"}, status=400)

        target_sheet = request.data.get('sheet_name', 'Table_Membre')

        try:
            # 1. Lire les onglets réels du fichier
            xl = pd.ExcelFile(file)
            available_sheets = xl.sheet_names

            # 2. Vérifier que l'onglet demandé existe dans le fichier
            if target_sheet not in available_sheets:
                return Response({
                    "error": (
                        f"L'onglet '{target_sheet}' n'existe pas dans ce fichier. "
                        f"Onglets disponibles : {', '.join(available_sheets)}"
                    ),
                    "available_sheets": available_sheets,
                }, status=400)

            # 3. Lire le contenu de l'onglet
            df = pd.read_excel(file, sheet_name=target_sheet)
            df = df.dropna(how='all')
            data_list = []

            for _, row in df.iterrows():
                # Logique pour l'onglet Membres (ou Table_Membre)
                if target_sheet in ('Table_Membre', 'Membres'):
                    user_email = row.get('Email')
                    default_password = str(row.get('Password', '123123'))
                    external_id = str(row.get('ID membre', ''))

                    if pd.notna(user_email) and user_email != "":
                        if "PHR" in external_id.upper():
                            portfolio_type = "PHR"
                        elif "FLG" in external_id.upper():
                            portfolio_type = "FLG"
                        else:
                            continue

                        phone_val = str(row.get('Téléphone') or row.get('Telephone') or row.get('Tel') or '').strip()
                        phone_clean = phone_val if phone_val not in ('nan', 'NaN', 'None', '') else None

                        user, user_created = User.objects.get_or_create(
                            email=user_email,
                            defaults={
                                'first_name': row.get('Nom & prénom', ''),
                                'phone': phone_clean,
                                'is_active': True
                            }
                        )

                        if user_created:
                            user.set_password(default_password)
                            user.save()
                        else:
                            # Mettre à jour le téléphone si présent dans l'Excel
                            if phone_clean and not user.phone:
                                user.phone = phone_clean
                                user.save(update_fields=['phone'])

                        try:
                            portfolio_obj = Portfolio.objects.get(type=portfolio_type)
                        except Portfolio.DoesNotExist:
                            portfolio_obj = Portfolio.objects.create(
                                type=portfolio_type,
                                name=f"Portfolio {portfolio_type}"
                            )

                        compte, account_created = Compte_member.objects.update_or_create(
                            member=user,
                            portfolio=portfolio_obj,
                            defaults={
                                'member_external_id': external_id,
                                'balance': _get_col(row,
                                    'Montant versé', 'Montant verse',
                                    'Capital investi (solde frais de gestion déduits)',
                                    'Capital investi', 'Balance', 'balance'),
                                'shares_count': _get_col(row,
                                    'Nbre de part', 'Nbre de parts', 'Nombre de parts',
                                    'Nombre parts', 'Parts', 'shares_count'),
                                'gross_value': _get_col(row,
                                    'Valeur nette', 'Valeur Nette',
                                    'Valeur Brute', 'Valeur brute',
                                    'Valeur Totale', 'Valeur totale',
                                    'Gross Value', 'gross_value', 'Valeur'),
                                'promesse_annuelle': _get_col(row,
                                    'Promesse Annuelle', 'Promesse annuelle', 'Promesse'),
                                'frais_gestion': _get_col(row,
                                    'Frais de gestion', 'Frais gestion', 'Frais'),
                                'capital_net': _get_col(row,
                                    'Capital investi (solde frais de gestion déduits)',
                                    'Capital investi', 'Capital net', 'Capital Net'),
                                'parts_pct': _get_col(row,
                                    'Parts détenues (%)', 'Parts detenues (%)',
                                    'Parts détenues', 'Parts (%)', '% Parts'),
                                'profit_type': str(row.get('Profit Type') or row.get('profit_type') or '').strip() or None,
                                'is_active': str(row.get('Statut Portfolio') or row.get('Statut') or row.get('Status') or '').strip() == 'Actif',
                            }
                        )

                        # Récupérer la date d'entrée si présente
                        date_val = row.get("Date d'entrée") or row.get('Date entree') or row.get('Date')
                        if date_val and str(date_val).strip() not in ('', 'nan', 'NaN', 'None'):
                            import datetime
                            try:
                                if isinstance(date_val, (datetime.date, datetime.datetime)):
                                    compte.date_entree = date_val if isinstance(date_val, datetime.date) else date_val.date()
                                else:
                                    compte.date_entree = pd.to_datetime(str(date_val), dayfirst=True).date()
                                compte.save(update_fields=['date_entree'])
                            except Exception:
                                pass

                        data_list.append({
                            "email": user_email,
                            "phone": user.phone or '',
                            "portfolio": portfolio_type,
                            "user_status": "Créé" if user_created else "Existant",
                            "account_status": "Créé" if account_created else "Mis à jour",
                            "gross_value": float(compte.gross_value),
                            "balance": float(compte.balance),
                        })

            return Response({
                "status": "success",
                "sheet_used": target_sheet,
                "processed_count": len(data_list),
                "columns_found": list(df.columns),
                "details": data_list
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Erreur d'import : {str(e)}")
            return Response({"error": str(e)}, status=500)
