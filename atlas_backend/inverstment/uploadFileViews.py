"""
Upload Excel — chaque onglet a sa propre méthode de migration.

Mapping onglet → table DB :
  Membres              → authentication_user + inverstment_compte_member
  Portfolio Phronesis* → inverstment_portfoliosnapshot + inverstment_snapshotrow
  Portfolio FlagShip*  → inverstment_portfoliosnapshot + inverstment_snapshotrow
  Journal_Transactions → inverstment_transaction
  Flux_Capitaux        → inverstment_transaction (dépôts/retraits membres)
"""

import datetime
import pandas as pd
from decimal import Decimal, InvalidOperation
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Compte_member, Portfolio, Transaction, PortfolioSnapshot, SnapshotRow

User = get_user_model()

# ─── Onglets reconnus ─────────────────────────────────────────────────────────

SHEET_HANDLERS = {
    'Membres':              'handle_membres',
    'Table_Membre':         'handle_membres',
    'Journal_Transactions': 'handle_transactions',
    'Flux_Capitaux':        'handle_flux_capitaux',
}
# Les onglets portfolio sont détectés dynamiquement (contiennent "Portfolio" ou "Phronesis" ou "FlagShip")

# ─── Helpers ──────────────────────────────────────────────────────────────────

def _dec(val, default=0):
    """Convertit une valeur en Decimal proprement."""
    if val is None:
        return Decimal(default)
    s = str(val).replace('\xa0', '').replace(' ', '').replace(',', '.') \
                .replace('CFA', '').replace('FCFA', '').replace('%', '').strip()
    if s in ('', '-', 'nan', 'NaN', 'None', '#N/A', '#VALUE!'):
        return Decimal(default)
    try:
        return Decimal(s)
    except InvalidOperation:
        return Decimal(default)


def _str(row, *keys, default=''):
    for k in keys:
        v = row.get(k)
        if v is not None and str(v).strip() not in ('', 'nan', 'NaN', 'None'):
            return str(v).strip()
    return default


def _date(val):
    if val is None:
        return None
    if isinstance(val, (datetime.date, datetime.datetime)):
        return val if isinstance(val, datetime.date) else val.date()
    try:
        return pd.to_datetime(str(val), dayfirst=True).date()
    except Exception:
        return None


def _detect_portfolio_sheet(sheet_name: str):
    """Retourne (portfolio_type, portfolio_name) si l'onglet est un onglet portfolio."""
    s = sheet_name.lower()
    if 'phronesis' in s or 'phr' in s:
        return 'PHR', sheet_name
    if 'flagship' in s or 'flag' in s or 'flg' in s:
        return 'FLG', sheet_name
    return None, None


# ─── Handlers par onglet ──────────────────────────────────────────────────────

def handle_membres(df, uploaded_by):
    """Onglet Membres → User + Compte_member."""
    results = []
    for _, row in df.iterrows():
        email = _str(row, 'Email', 'email')
        if not email:
            continue

        external_id = _str(row, 'ID membre', 'ID Membre', 'id_membre')
        if not external_id:
            continue

        # Déterminer le type de portfolio depuis l'ID
        eid_upper = external_id.upper()
        if 'PHR' in eid_upper:
            portfolio_type = 'PHR'
        elif 'FLG' in eid_upper:
            portfolio_type = 'FLG'
        else:
            continue

        phone = _str(row, 'Téléphone', 'Telephone', 'Tel', 'Phone')
        nom = _str(row, 'Nom & prénom', 'Nom & prenom', 'Nom', 'Name')
        password = _str(row, 'Password', 'Mot de passe', default='Defaut@123')

        # Créer ou récupérer l'utilisateur
        user, created = User.objects.get_or_create(
            email=email,
            defaults={'first_name': nom, 'phone': phone or None, 'is_active': True}
        )
        if created:
            user.set_password(password)
            user.save()
        elif phone and not user.phone:
            user.phone = phone
            user.save(update_fields=['phone'])

        # Portfolio
        try:
            portfolio_obj = Portfolio.objects.get(type=portfolio_type)
        except Portfolio.DoesNotExist:
            portfolio_obj = Portfolio.objects.create(
                type=portfolio_type,
                name=f'Portfolio {portfolio_type}',
                created_by=uploaded_by
            )

        # Compte membre - Chercher d'abord par member_external_id pour éviter les doublons
        try:
            # Essayer de trouver un compte existant avec cet external_id
            compte = Compte_member.objects.get(member_external_id=external_id)
            # Mettre à jour les données
            compte.member = user
            compte.portfolio = portfolio_obj
            compte.balance = _dec(row.get('Montant versé') or row.get('Montant verse'))
            compte.shares_count = _dec(row.get('Nbre de part') or row.get('Nbre de parts'))
            compte.gross_value = _dec(row.get('Valeur nette') or row.get('Valeur Nette') or row.get('Valeur Brute'))
            compte.promesse_annuelle = _dec(row.get('Promesse Annuelle') or row.get('Promesse annuelle'))
            compte.frais_gestion = _dec(row.get('Frais de gestion') or row.get('Frais gestion'))
            compte.capital_net = _dec(row.get('Capital investi (solde frais de gestion déduits)') or row.get('Capital investi'))
            compte.parts_pct = _dec(row.get("Parts détenues (%)") or row.get('Parts detenues (%)'))
            compte.profit_type = _str(row, 'Profit Type', 'profit_type') or None
            compte.is_active = _str(row, 'Statut Portfolio', 'Statut', 'Status') == 'Actif'
            compte.save()
            acc_created = False
        except Compte_member.DoesNotExist:
            # Le compte n'existe pas, le créer
            compte, acc_created = Compte_member.objects.get_or_create(
                member=user,
                portfolio=portfolio_obj,
                defaults={
                    'member_external_id': external_id,
                    'balance':           _dec(row.get('Montant versé') or row.get('Montant verse')),
                    'shares_count':      _dec(row.get('Nbre de part') or row.get('Nbre de parts')),
                    'gross_value':       _dec(row.get('Valeur nette') or row.get('Valeur Nette') or row.get('Valeur Brute')),
                    'promesse_annuelle': _dec(row.get('Promesse Annuelle') or row.get('Promesse annuelle')),
                    'frais_gestion':     _dec(row.get('Frais de gestion') or row.get('Frais gestion')),
                    'capital_net':       _dec(row.get('Capital investi (solde frais de gestion déduits)') or row.get('Capital investi')),
                    'parts_pct':         _dec(row.get("Parts détenues (%)") or row.get('Parts detenues (%)')),
                    'profit_type':       _str(row, 'Profit Type', 'profit_type') or None,
                    'is_active':         _str(row, 'Statut Portfolio', 'Statut', 'Status') == 'Actif',
                }
            )

        # Date d'entrée
        d = _date(row.get("Date d'entrée") or row.get('Date entree') or row.get('Date'))
        if d:
            compte.date_entree = d
            compte.save(update_fields=['date_entree'])

        results.append({
            'email': email, 'phone': user.phone or '',
            'portfolio': portfolio_type,
            'user': 'Créé' if created else 'Existant',
            'compte': 'Créé' if acc_created else 'Mis à jour',
            'balance': float(compte.balance),
            'gross_value': float(compte.gross_value),
        })
    return results


def handle_portfolio_snapshot(df, sheet_name, uploaded_by, file=None):
    """Onglets Portfolio Phronesis / FlagShip → PortfolioSnapshot + SnapshotRow."""
    portfolio_type, portfolio_name = _detect_portfolio_sheet(sheet_name)

    # ── Trouver la vraie ligne d'en-tête ─────────────────────────────────────
    # Le fichier Excel a des métadonnées en haut (VNL, date...) avant le tableau.
    # On cherche la ligne qui contient "Actifs" pour l'utiliser comme en-tête.
    real_df = df  # fallback
    vnl = None

    if file is not None:
        try:
            file.seek(0)
            df_raw = pd.read_excel(file, sheet_name=sheet_name, header=None)
            file.seek(0)

            header_row_idx = None
            for i, row in df_raw.iterrows():
                row_vals = [str(v).strip().lower() for v in row.values if pd.notna(v) and str(v).strip()]
                # Chercher la ligne d'en-tête (contient "actifs" ou "actif")
                if any(v in ('actifs', 'actif', 'asset', 'titre') for v in row_vals):
                    header_row_idx = i
                    break
                # Chercher la VNL dans les premières lignes
                for j, v in enumerate(row.values):
                    if pd.notna(v) and str(v).strip().upper() == 'VNL':
                        # La valeur VNL est dans la cellule suivante
                        if j + 1 < len(row.values) and pd.notna(row.values[j + 1]):
                            vnl = _dec(row.values[j + 1]) or None

            if header_row_idx is not None:
                file.seek(0)
                real_df = pd.read_excel(file, sheet_name=sheet_name, header=header_row_idx)
                real_df = real_df.dropna(how='all')
                # Normaliser les noms de colonnes (supprimer \n)
                real_df.columns = [str(c).replace('\n', ' ').strip() for c in real_df.columns]
                file.seek(0)
        except Exception as e:
            print(f"Erreur détection en-tête: {e}")
            real_df = df

    # Normaliser les colonnes du df de base aussi
    real_df.columns = [str(c).replace('\n', ' ').strip() for c in real_df.columns]

    snapshot = PortfolioSnapshot.objects.create(
        portfolio_name=portfolio_name,
        semaine=sheet_name,
        vnl=vnl,
        uploaded_by=uploaded_by,
    )

    SKIP_ROWS = {
        'total', 'total général', 'total ci', 'liquidité réservée',
        'total liquidité', 'valorisation du portefeuille', 'total general',
        'liquidity', 'note', '', 'actifs', 'actif', 'asset',
        'total liquidite', 'liquidite reservee',
    }

    def gc(row, *keys):
        """Cherche une valeur numérique dans plusieurs colonnes possibles."""
        for k in keys:
            # Recherche exacte
            v = row.get(k)
            if v is not None and str(v).strip() not in ('', 'nan', 'NaN', 'None', '-', '#N/A'):
                result = _dec(v)
                if result != 0:
                    return result
            # Recherche partielle dans les colonnes
            for col in row.index:
                col_clean = str(col).lower().replace('\n', ' ').strip()
                if k.lower() in col_clean:
                    v2 = row[col]
                    if v2 is not None and str(v2).strip() not in ('', 'nan', 'NaN', 'None', '-', '#N/A'):
                        result = _dec(v2)
                        if result != 0:
                            return result
        return _dec(0)

    rows_created = []
    for _, row in real_df.iterrows():
        # Chercher le nom de l'actif
        actif = None
        for col_candidate in ['Actifs', 'actifs', 'Actif', 'Asset', 'Titre', 'ACTIFS']:
            v = row.get(col_candidate)
            if v and str(v).strip() not in ('', 'nan', 'NaN', 'None'):
                actif = str(v).strip()
                break

        if not actif or actif.lower() in SKIP_ROWS:
            continue

        SnapshotRow.objects.create(
            snapshot=snapshot,
            actif=actif,
            poids=gc(row, "Poids de l'actifs dans le Portfolio", "Poids de l'actif dans le Portfolio", "Poids"),
            quantite=gc(row, 'Quantité', 'Quantite', 'Qté', 'Qty'),
            cours_achat=gc(row, "cours d'achat", "Cours d'achat", "Cours achat"),
            cours_cloture=gc(row, 'cours de clôture', 'cours de cloture', 'Cours clôture', 'Capital Clôture', 'Clôture'),
            dividende=gc(row, 'Dividende s/intérêts', 'Dividende s/interets', 'Dividende'),
            rendement_brut=gc(row, 'Rendement brut', 'Rendement Brut'),
            investissement=gc(row, 'Investissement', 'Capital de départ'),
            valorisation=gc(row, "Valorisation de l'actif", "Valorisation de l actif", 'Valorisation'),
            rendement_annuel=gc(row, 'Rendement annuel', 'Rendement Annuel'),
            variation_semaine=gc(row, 'Variation par rapport à la semaine précédente', 'Variation semaine', 'Variation'),
        )
        rows_created.append(actif)

    return {
        'snapshot_id': snapshot.id,
        'portfolio': portfolio_name,
        'rows_imported': len(rows_created),
        'actifs': rows_created,
    }



def handle_transactions(df, uploaded_by):
    """Onglet Journal_Transactions → Transaction."""
    results = []
    for _, row in df.iterrows():
        t_type = _str(row, 'Type', 'type', 'Transaction Type')
        date_val = _date(row.get('Date') or row.get('date'))
        portfolio = _str(row, 'Portfolio', 'Portefeuille', 'portfolio')
        amount = _dec(row.get('Montant') or row.get('Amount') or row.get('Valeur'))

        if not t_type or not date_val or not amount:
            continue

        # Normaliser le type
        t_map = {
            'depot': 'DEPOSIT', 'dépôt': 'DEPOSIT', 'deposit': 'DEPOSIT',
            'retrait': 'WITHDRAWAL', 'withdrawal': 'WITHDRAWAL',
            'achat': 'BUY', 'buy': 'BUY',
            'vente': 'SELL', 'sell': 'SELL',
            'dividende': 'DIVIDEND', 'dividend': 'DIVIDEND',
            'intérêt': 'INTEREST', 'interest': 'INTEREST',
        }
        t_type_norm = t_map.get(t_type.lower(), t_type.upper())

        # Normaliser le portfolio
        p_map = {'phr': 'PHRONESIS', 'phronesis': 'PHRONESIS', 'flg': 'FLAGSHIP', 'flagship': 'FLAGSHIP'}
        portfolio_norm = p_map.get(portfolio.lower(), portfolio.upper())

        t = Transaction.objects.create(
            type=t_type_norm,
            date=date_val,
            portfolio=portfolio_norm,
            amount=amount,
            asset=_str(row, 'Actif', 'Asset', 'Symbol') or None,
            quantity=_dec(row.get('Quantité') or row.get('Qty')) or None,
            price=_dec(row.get('Prix') or row.get('Price')) or None,
            member_id=_str(row, 'ID membre', 'Member ID') or None,
            description=_str(row, 'Description', 'Note', 'Commentaire') or None,
        )
        results.append({'id': t.id, 'type': t_type_norm, 'amount': float(amount), 'date': str(date_val)})
    return results


def handle_flux_capitaux(df, uploaded_by):
    """Onglet Flux_Capitaux → Transaction (dépôts/retraits membres)."""
    results = []
    for _, row in df.iterrows():
        email = _str(row, 'Email', 'email')
        amount = _dec(row.get('Montant') or row.get('Amount') or row.get('Flux'))
        date_val = _date(row.get('Date') or row.get('date'))

        if not amount or not date_val:
            continue

        portfolio = _str(row, 'Portfolio', 'Portefeuille', default='PHRONESIS')
        p_map = {'phr': 'PHRONESIS', 'phronesis': 'PHRONESIS', 'flg': 'FLAGSHIP', 'flagship': 'FLAGSHIP'}
        portfolio_norm = p_map.get(portfolio.lower(), 'PHRONESIS')

        t_type = 'DEPOSIT' if float(amount) >= 0 else 'WITHDRAWAL'

        member = None
        if email:
            try:
                member = User.objects.get(email=email)
            except User.DoesNotExist:
                pass

        t = Transaction.objects.create(
            type=t_type,
            date=date_val,
            portfolio=portfolio_norm,
            amount=abs(amount),
            member_id=_str(row, 'ID membre', 'Member ID') or None,
            receiver=member if t_type == 'DEPOSIT' else None,
            sender=member if t_type == 'WITHDRAWAL' else None,
            description=_str(row, 'Description', 'Note') or f'Import Flux_Capitaux',
        )
        results.append({'id': t.id, 'type': t_type, 'amount': float(abs(amount))})
    return results


# ─── Views ────────────────────────────────────────────────────────────────────

class ExcelSheetsView(APIView):
    """Retourne les onglets + colonnes du fichier Excel."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Fichier manquant'}, status=400)
        try:
            xl = pd.ExcelFile(file)
            sheets_info = {}
            for sheet in xl.sheet_names:
                try:
                    df = pd.read_excel(file, sheet_name=sheet, nrows=3)
                    sheets_info[sheet] = list(df.columns)
                except Exception:
                    sheets_info[sheet] = []

            # Identifier le handler pour chaque onglet
            sheet_handlers = {}
            for sheet in xl.sheet_names:
                if sheet in SHEET_HANDLERS:
                    sheet_handlers[sheet] = SHEET_HANDLERS[sheet]
                else:
                    pt, _ = _detect_portfolio_sheet(sheet)
                    if pt:
                        sheet_handlers[sheet] = 'handle_portfolio_snapshot'
                    else:
                        sheet_handlers[sheet] = None

            return Response({
                'sheets': xl.sheet_names,
                'sheets_columns': sheets_info,
                'sheet_handlers': sheet_handlers,
                'allowed_sheets': list(SHEET_HANDLERS.keys()) + ['Portfolio Phronesis*', 'Portfolio FlagShip*'],
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class AssetUploadView(APIView):
    """Upload Excel — route vers le bon handler selon l'onglet sélectionné."""
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if not request.user.role or request.user.role.name != 'admin':
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=403)

        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Fichier manquant'}, status=400)

        target_sheet = request.data.get('sheet_name', '')

        try:
            xl = pd.ExcelFile(file)
            available = xl.sheet_names

            if not target_sheet:
                target_sheet = available[0]

            if target_sheet not in available:
                return Response({
                    'error': f"Onglet '{target_sheet}' introuvable. Disponibles : {', '.join(available)}",
                    'available_sheets': available,
                }, status=400)

            df = pd.read_excel(file, sheet_name=target_sheet)
            df = df.dropna(how='all')

            # Router vers le bon handler
            if target_sheet in SHEET_HANDLERS:
                handler_name = SHEET_HANDLERS[target_sheet]
                handler = globals()[handler_name]
                result = handler(df, request.user)
                return Response({
                    'status': 'success',
                    'sheet_used': target_sheet,
                    'handler': handler_name,
                    'processed_count': len(result),
                    'columns_found': list(df.columns),
                    'details': result,
                }, status=201)

            # Onglets portfolio (Phronesis / FlagShip)
            pt, _ = _detect_portfolio_sheet(target_sheet)
            if pt:
                result = handle_portfolio_snapshot(df, target_sheet, request.user, file)
                return Response({
                    'status': 'success',
                    'sheet_used': target_sheet,
                    'handler': 'handle_portfolio_snapshot',
                    'columns_found': list(df.columns),
                    **result,
                }, status=201)

            return Response({
                'error': f"Aucun handler pour l'onglet '{target_sheet}'. "
                         f"Onglets supportés : {', '.join(list(SHEET_HANDLERS.keys()) + ['Portfolio Phronesis*', 'Portfolio FlagShip*'])}",
                'available_sheets': available,
            }, status=400)

        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=500)
