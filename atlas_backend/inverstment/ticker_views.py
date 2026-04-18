"""
Ticker d'actifs — affiche les actifs du portfolio avec leur cours et variation.
Source : CoinGecko (crypto), Frankfurter (forex), yfinance (actions/ETFs).
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import PortfolioSnapshot, SnapshotRow, TickerAsset
from .market_service import refresh_ticker_assets, fetch_market_price, COINGECKO_IDS, FOREX_PAIRS


class TickerListView(APIView):
    """GET  — liste des actifs du ticker avec variation.
       POST — ajouter un actif au ticker.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Rafraîchir les prix depuis le marché
        try:
            refresh_ticker_assets()
        except Exception:
            pass  # On affiche les derniers prix connus si l'API est indisponible

        assets = TickerAsset.objects.filter(is_active=True).order_by('order', 'symbol')
        data = [{
            'id': a.id,
            'symbol': a.symbol,
            'name': a.name,
            'current_price': float(a.current_price),
            'variation': float(a.variation_pct),
            'currency': a.currency,
            'is_active': a.is_active,
            'order': a.order,
        } for a in assets]
        return Response({'assets': data, 'total': len(data)})

    def post(self, request):
        if not request.user.role or request.user.role.name != 'admin':
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=403)

        symbol = request.data.get('symbol', '').strip().upper()
        name = request.data.get('name', '').strip()
        current_price = request.data.get('current_price', 0)
        variation_pct = request.data.get('variation_pct', 0)

        if not symbol:
            return Response({'error': 'Le symbole est requis.'}, status=400)

        asset, created = TickerAsset.objects.get_or_create(
            symbol=symbol,
            defaults={
                'name': name or symbol,
                'current_price': current_price,
                'variation_pct': variation_pct,
                'is_active': True,
            }
        )
        if not created:
            asset.name = name or asset.name
            asset.is_active = True
            asset.save()

        # Récupérer le prix réel depuis le marché
        try:
            market = fetch_market_price(symbol)
            if market:
                asset.current_price = market['price']
                asset.variation_pct = market['variation']
                asset.save(update_fields=['current_price', 'variation_pct'])
        except Exception:
            pass

        return Response({
            'success': True,
            'asset': {
                'id': asset.id,
                'symbol': asset.symbol,
                'name': asset.name,
                'current_price': float(asset.current_price),
                'variation': float(asset.variation_pct),
            }
        }, status=201 if created else 200)


class TickerDetailView(APIView):
    """PATCH — modifier, DELETE — supprimer un actif du ticker."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, asset_id):
        if not request.user.role or request.user.role.name != 'admin':
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=403)
        try:
            asset = TickerAsset.objects.get(id=asset_id)
            for field in ['name', 'current_price', 'variation_pct', 'is_active', 'order']:
                if field in request.data:
                    setattr(asset, field, request.data[field])
            asset.save()
            return Response({'success': True, 'symbol': asset.symbol})
        except TickerAsset.DoesNotExist:
            return Response({'error': 'Actif introuvable.'}, status=404)

    def delete(self, request, asset_id):
        if not request.user.role or request.user.role.name != 'admin':
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=403)
        try:
            TickerAsset.objects.get(id=asset_id).delete()
            return Response({'success': True})
        except TickerAsset.DoesNotExist:
            return Response({'error': 'Actif introuvable.'}, status=404)


class TickerSyncView(APIView):
    """POST — synchronise le ticker depuis le marché en temps réel."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.role or request.user.role.name != 'admin':
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=403)

        action = request.data.get('action', 'market')  # 'market' ou 'snapshot'

        if action == 'snapshot':
            # Sync depuis le dernier snapshot
            synced = []
            try:
                latest = PortfolioSnapshot.objects.order_by('-created_at').first()
                if not latest:
                    return Response({'error': 'Aucun snapshot disponible.'}, status=400)
                rows = SnapshotRow.objects.filter(snapshot=latest).exclude(
                    actif__in=['', 'Total', 'Total Général', 'Liquidité réservée',
                               'Total liquidité', 'Valorisation du portefeuille']
                )
                for row in rows:
                    if not row.actif or not row.cours_cloture:
                        continue
                    TickerAsset.objects.update_or_create(
                        symbol=row.actif[:20],
                        defaults={
                            'name': row.actif,
                            'current_price': float(row.cours_cloture),
                            'variation_pct': float(row.variation_semaine) * 100 if row.variation_semaine else 0,
                            'is_active': True,
                        }
                    )
                    synced.append(row.actif[:20])
            except Exception as e:
                return Response({'error': str(e)}, status=500)
            return Response({'success': True, 'action': 'snapshot', 'synced': len(synced)})

        else:
            # Sync depuis le marché en temps réel
            try:
                result = refresh_ticker_assets()
                return Response({'success': True, 'action': 'market', **result})
            except Exception as e:
                return Response({'error': str(e)}, status=500)
