from django.core.management.base import BaseCommand
from django.utils import timezone 
from inverstment.usdt_transaction.usdt_service import crypto_service  # ✅ Direct
import time
import signal

class Command(BaseCommand):
    help = 'Surveille automatiquement la blockchain TRON pour les paiements USDT'
    
    def __init__(self):
        super().__init__()
        self.crypto_service = crypto_service  # ✅ Utiliser directement
        self.running = True  # ✅ Corriger faute
        
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
    
    def signal_handler(self, signum, frame):
        self.stdout.write(self.style.WARNING('\n🛑 Arrêt monitoring...'))
        self.running = False
    
    def add_arguments(self, parser):
        parser.add_argument('--interval', type=int, default=30)
        parser.add_argument('--verbose', action='store_true')  # ✅ Ajouter
    
    def handle(self, *args, **options):
        interval = options['interval']
        verbose = options['verbose']
        
        self.stdout.write(self.style.SUCCESS(f'🚀 Surveillance TRON démarrée'))
        
        cycle_count = 0
        while self.running:  # ✅ Corriger
            try:
                cycle_count += 1
                if verbose:
                    self.stdout.write(f'🔄 Cycle #{cycle_count}')
                
                # ✅ Utiliser directement crypto_service
                results = self._check_payments()
                
                if results['processed'] > 0:
                    self.stdout.write(self.style.SUCCESS(f'✅ {results["processed"]} paiements traités'))
                
                time.sleep(interval)
                
            except KeyboardInterrupt:
                break
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Erreur: {e}'))
                time.sleep(interval * 2)
    
    def _check_payments(self):
        """Logique de vérification simple"""
        from inverstment.models import USDTPayment
        
        stats = {'checked': 0, 'processed': 0, 'expired': 0}
        
        # Marquer expirées
        expired = USDTPayment.objects.filter(
            status='PENDING', 
            expires_at__lte=timezone.now()
        ).update(status='EXPIRED')
        stats['expired'] = expired
        
        # Récupérer pending
        pending = USDTPayment.objects.filter(
            status='PENDING',
            expires_at__gt=timezone.now()
        )
        stats['checked'] = pending.count()
        
        # ✅ AJOUTER CES LOGS DE DEBUG
        print(f"🔍 DEBUG: {stats['checked']} transactions PENDING trouvées")
        for tx in pending:
            print(f"   📋 {tx.transaction_id} - {tx.amount_usdt} USDT - Expire: {tx.expires_at}")
        
        # Vérifier avec blockchain
        transfers = self.crypto_service.check_wallet_transactions()
        print(f"🔍 DEBUG: {len(transfers)} transferts blockchain récupérés")
        
        for tx in pending:
            for transfer in transfers:
                amount_match = abs(float(transfer.get('quant', 0))/1000000 - float(tx.amount_usdt)) <= 0.01
                if amount_match:
                    success, _ = self.crypto_service.process_payment(tx.transaction_id, transfer.get('transaction_id'))
                    if success:
                        stats['processed'] += 1
                        break
        
        return stats
