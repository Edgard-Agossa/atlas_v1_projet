# 🚀 Module de Paiement Crypto - Documentation d'Intégration

## 📋 Vue d'Ensemble

Ce module permet aux utilisateurs d'effectuer des dépôts en USDT (réseau TRC20) via une interface moderne et intuitive. Il comprend la génération de QR codes, le suivi en temps réel des transactions, et la gestion complète du cycle de paiement.

## 🎯 Fonctionnalités Implémentées

### ✅ Composants Créés

1. **CryptoPaymentModal** - Modal principal de paiement
2. **CryptoPaymentHistory** - Historique des transactions crypto
3. **CryptoPaymentService** - Service API pour les interactions backend

### ✅ Fonctionnalités

- ✅ Sélection du montant avec validation (min: 10 USDT, max: 10,000 USDT)
- ✅ Génération automatique de QR Code
- ✅ Compte à rebours de 15 minutes
- ✅ Vérification automatique du statut toutes les 5 secondes
- ✅ Interface responsive (mobile/desktop)
- ✅ Support du mode sombre
- ✅ Notifications de succès
- ✅ Historique des paiements avec liens TronScan

## 🔧 Installation

### 1. Installer les Dépendances

```bash
cd Atlas-V1.0
npm install qrcode @types/qrcode
```

### 2. Fichiers Créés

```
src/
├── components/
│   ├── CryptoPaymentModal.tsx      # Modal principal
│   └── CryptoPaymentHistory.tsx    # Historique
├── services/
│   └── cryptoPaymentService.ts     # Service API
└── pages/
    └── Transactions.tsx            # Modifié (bouton ajouté)
```

## 🚀 Utilisation

### Intégration dans une Page

```typescript
import React, { useState } from 'react';
import CryptoPaymentModal from '../components/CryptoPaymentModal';
import { Wallet } from 'lucide-react';

const MyPage: React.FC = () => {
  const [showCryptoModal, setShowCryptoModal] = useState(false);

  return (
    <div>
      {/* Bouton pour ouvrir le modal */}
      <button 
        onClick={() => setShowCryptoModal(true)}
        className="btn-primary flex items-center"
      >
        <Wallet className="w-4 h-4 mr-2" />
        Dépôt USDT
      </button>

      {/* Modal de paiement */}
      <CryptoPaymentModal
        isOpen={showCryptoModal}
        onClose={() => setShowCryptoModal(false)}
        onSuccess={() => {
          // Actions après succès
          console.log('Paiement confirmé!');
          // Actualiser les données, etc.
        }}
      />
    </div>
  );
};
```

### Affichage de l'Historique

```typescript
import CryptoPaymentHistory from '../components/CryptoPaymentHistory';

const HistoryPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <CryptoPaymentHistory />
    </div>
  );
};
```

## 🔌 API Backend Requise

### Endpoints Nécessaires

```typescript
// 1. Initier un dépôt
POST /api/investment/usdt/deposit/request/
Body: { amount: number, portfolio: string }
Response: {
  success: boolean,
  payment_id: string,
  deposit_address: string,
  amount_usdt: string,
  network: string,
  expires_in: string
}

// 2. Vérifier le statut
GET /api/investment/usdt/status/{payment_id}/
Response: {
  success: boolean,
  status: 'PENDING' | 'CONFIRMED' | 'FAILED',
  tx_hash?: string,
  amount_received?: string,
  confirmed_at?: string
}

// 3. Historique des paiements
GET /api/investment/usdt/history/
Response: {
  success: boolean,
  payments: Array<{
    id: string,
    type: 'DEPOSIT' | 'WITHDRAWAL',
    amount: string,
    network: string,
    status: string,
    wallet_address: string,
    tx_hash?: string,
    created_at: string,
    confirmed_at?: string
  }>
}
```

## 🎨 Personnalisation

### Modifier les Limites de Montant

```typescript
// Dans CryptoPaymentModal.tsx
const MIN_AMOUNT = 10;    // Montant minimum
const MAX_AMOUNT = 10000; // Montant maximum
const TIMER_DURATION = 900; // 15 minutes en secondes
```

### Personnaliser les Couleurs

```typescript
// Classes Tailwind utilisées
const primaryButton = "bg-blue-600 hover:bg-blue-700";
const successColor = "text-green-600";
const warningColor = "text-yellow-600";
const dangerColor = "text-red-600";
```

### Modifier le Polling Interval

```typescript
// Dans CryptoPaymentModal.tsx
const POLLING_INTERVAL = 5000; // 5 secondes
```

## 📱 Responsive Design

Le module est entièrement responsive avec :

- **Mobile** : Modal plein écran, boutons tactiles optimisés
- **Tablet** : Interface adaptée aux écrans moyens
- **Desktop** : Modal centré avec largeur optimale

## 🌙 Mode Sombre

Support complet du mode sombre avec :
- Classes Tailwind `dark:` pour tous les éléments
- Adaptation automatique selon le thème système
- QR Code avec fond blanc pour la lisibilité

## 🔒 Sécurité

### Validations Côté Client

- Montant minimum/maximum
- Format d'adresse TRON
- Validation des données d'entrée

### Bonnes Pratiques

- Tokens JWT dans les headers
- Gestion des erreurs réseau
- Timeout des requêtes
- Validation des réponses API

## 🐛 Gestion d'Erreurs

### Types d'Erreurs Gérées

1. **Erreurs Réseau** - Connexion API échouée
2. **Erreurs de Validation** - Montant invalide, etc.
3. **Erreurs Backend** - Réponses d'erreur du serveur
4. **Timeout** - Expiration du délai de paiement

### Messages d'Erreur

```typescript
const errorMessages = {
  NETWORK_ERROR: 'Erreur réseau. Vérifiez votre connexion.',
  INVALID_AMOUNT: 'Montant invalide. Min: 10 USDT, Max: 10,000 USDT',
  PAYMENT_EXPIRED: 'Délai de paiement expiré. Veuillez recommencer.',
  TRANSACTION_FAILED: 'Transaction échouée. Contactez le support.'
};
```

## 🧪 Tests

### Tests Manuels Recommandés

1. **Flux Complet**
   - Ouvrir le modal
   - Saisir un montant valide
   - Vérifier la génération du QR code
   - Tester le compte à rebours
   - Simuler une transaction

2. **Cas d'Erreur**
   - Montant trop faible/élevé
   - Perte de connexion réseau
   - Expiration du timer

3. **Responsive**
   - Tester sur mobile/tablet/desktop
   - Vérifier le mode sombre

## 🚀 Déploiement

### Variables d'Environnement

```typescript
// Dans cryptoPaymentService.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';
```

### Build de Production

```bash
npm run build
```

## 📞 Support

### Logs de Debug

Le module inclut des logs détaillés :

```typescript
console.log('Payment initiated:', paymentData);
console.log('Status check:', statusData);
console.error('Payment error:', error);
```

### Monitoring

Surveillez ces métriques :
- Taux de succès des paiements
- Temps moyen de confirmation
- Erreurs API fréquentes

---

## ✨ Résumé

Le module de paiement crypto est maintenant **entièrement fonctionnel** avec :

- ✅ Interface utilisateur complète
- ✅ Gestion des états et erreurs
- ✅ Timer et polling automatique
- ✅ QR Code interactif
- ✅ Design responsive et mode sombre
- ✅ Service API structuré
- ✅ Documentation complète

**Prêt pour l'intégration et les tests !** 🎉