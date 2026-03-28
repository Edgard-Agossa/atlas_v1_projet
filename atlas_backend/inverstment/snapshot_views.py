import csv
import io
from decimal import Decimal, InvalidOperation
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import models
from .models import PortfolioSnapshot, SnapshotRow


class PortfolioSnapshotUploadView(APIView):
    """Upload d'un CSV de récapitulatif portfolio — crée un nouveau snapshot."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.role or request.user.role.name != 'admin':
            return Response({'error': 'Accès réservé aux administrateurs.'},
                            status=status.HTTP_403_FORBIDDEN)

        file = request.FILES.get('file')
        portfolio_name = request.data.get('portfolio_name', 'Phronesis')
        semaine = request.data.get('semaine', '')
        vnl = request.data.get('vnl', None)

        if not file:
            return Response({'error': 'Fichier CSV manquant.'}, status=status.HTTP_400_BAD_REQUEST)

        if not file.name.endswith('.csv'):
            return Response({'error': 'Seuls les fichiers .csv sont acceptés.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded = file.read().decode('utf-8-sig')
            reader = csv.DictReader(io.StringIO(decoded))

            # Normaliser les noms de colonnes (strip espaces)
            rows_data = []
            for row in reader:
                clean = {k.strip(): v.strip() if isinstance(v, str) else v for k, v in row.items()}
                rows_data.append(clean)

            if not rows_data:
                return Response({'error': 'Le fichier CSV est vide.'}, status=status.HTTP_400_BAD_REQUEST)

            def to_decimal(val, default=0):
                try:
                    cleaned = str(val).replace(' ', '').replace(',', '.').replace('%', '')
                    return Decimal(cleaned) if cleaned not in ('', '-', 'None', 'nan') else Decimal(default)
                except (InvalidOperation, ValueError):
                    return Decimal(default)

            # Créer le snapshot
            snapshot = PortfolioSnapshot.objects.create(
                portfolio_name=portfolio_name,
                semaine=semaine,
                vnl=to_decimal(vnl) if vnl else None,
                uploaded_by=request.user,
            )

            created_rows = []
            for row in rows_data:
                actif = row.get('Actifs', '') or row.get('actifs', '')
                if not actif or actif.lower() in ('total', 'total général', 'total ci',
                                                   'liquidité réservée', 'total liquidité',
                                                   'valorisation du portefeuille'):
                    continue

                snap_row = SnapshotRow.objects.create(
                    snapshot=snapshot,
                    actif=actif,
                    poids=to_decimal(row.get('Poids de l\'actif dans le Portfolio', row.get('Poids', 0))),
                    quantite=to_decimal(row.get('Quantité', row.get('Quantite', 0))),
                    cours_achat=to_decimal(row.get('cours d\'achat', row.get('Cours achat', 0))),
                    cours_cloture=to_decimal(row.get('cours de clôture', row.get('Cours cloture', 0))),
                    dividende=to_decimal(row.get('Dividende s/intérêts', row.get('Dividende', 0))),
                    rendement_brut=to_decimal(row.get('Rendement brut', 0)),
                    investissement=to_decimal(row.get('Investissement', 0)),
                    valorisation=to_decimal(row.get('Valorisation de l\'actif', row.get('Valorisation', 0))),
                    rendement_annuel=to_decimal(row.get('Rendement annuel', 0)),
                    variation_semaine=to_decimal(row.get('Variation par rapport à la semaine précédente',
                                                          row.get('Variation semaine', 0))),
                )
                created_rows.append(snap_row.actif)

            return Response({
                'success': True,
                'snapshot_id': snapshot.id,
                'portfolio_name': snapshot.portfolio_name,
                'semaine': snapshot.semaine,
                'rows_imported': len(created_rows),
                'actifs': created_rows,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': f'Erreur lors du traitement : {str(e)}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PortfolioSnapshotListView(APIView):
    """Liste tous les snapshots disponibles (résumé)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        snapshots = PortfolioSnapshot.objects.all().order_by('-created_at')
        data = [{
            'id': s.id,
            'portfolio_name': s.portfolio_name,
            'semaine': s.semaine,
            'vnl': str(s.vnl) if s.vnl else None,
            'rows_count': s.rows.count(),
            'created_at': s.created_at,
            'uploaded_by': s.uploaded_by.full_name if s.uploaded_by else None,
        } for s in snapshots]
        return Response({'snapshots': data, 'total': len(data)})


class PortfolioSnapshotDetailView(APIView):
    """Détail complet d'un snapshot avec toutes ses lignes."""
    permission_classes = [IsAuthenticated]

    def get(self, request, snapshot_id):
        try:
            snapshot = PortfolioSnapshot.objects.get(id=snapshot_id)
        except PortfolioSnapshot.DoesNotExist:
            return Response({'error': 'Snapshot introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        rows = snapshot.rows.all().order_by('id')

        # Calculs agrégés
        total_investissement = rows.aggregate(t=models.Sum('investissement'))['t'] or Decimal(0)
        total_valorisation = rows.aggregate(t=models.Sum('valorisation'))['t'] or Decimal(0)
        total_dividende = rows.aggregate(t=models.Sum('dividende'))['t'] or Decimal(0)
        perf_globale = ((total_valorisation - total_investissement) / total_investissement * 100
                        if total_investissement > 0 else Decimal(0))

        rows_data = [{
            'id': r.id,
            'actif': r.actif,
            'poids': str(r.poids),
            'quantite': str(r.quantite),
            'cours_achat': str(r.cours_achat),
            'cours_cloture': str(r.cours_cloture),
            'dividende': str(r.dividende),
            'rendement_brut': str(r.rendement_brut),
            'investissement': str(r.investissement),
            'valorisation': str(r.valorisation),
            'rendement_annuel': str(r.rendement_annuel),
            'variation_semaine': str(r.variation_semaine),
        } for r in rows]

        return Response({
            'id': snapshot.id,
            'portfolio_name': snapshot.portfolio_name,
            'semaine': snapshot.semaine,
            'vnl': str(snapshot.vnl) if snapshot.vnl else None,
            'created_at': snapshot.created_at,
            'uploaded_by': snapshot.uploaded_by.full_name if snapshot.uploaded_by else None,
            'summary': {
                'total_investissement': str(total_investissement),
                'total_valorisation': str(total_valorisation),
                'total_dividende': str(total_dividende),
                'performance_globale': str(round(perf_globale, 2)),
            },
            'rows': rows_data,
        })

    def delete(self, request, snapshot_id):
        if not request.user.role or request.user.role.name != 'admin':
            return Response({'error': 'Accès réservé aux administrateurs.'},
                            status=status.HTTP_403_FORBIDDEN)
        try:
            snapshot = PortfolioSnapshot.objects.get(id=snapshot_id)
            snapshot.delete()
            return Response({'success': True, 'message': 'Snapshot supprimé.'})
        except PortfolioSnapshot.DoesNotExist:
            return Response({'error': 'Snapshot introuvable.'}, status=status.HTTP_404_NOT_FOUND)
