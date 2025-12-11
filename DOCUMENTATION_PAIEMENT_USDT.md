# 📋 Documentation - Système de Paiement USDT

## 🎯 Vue d'ensemble

Le système de paiement USDT permet aux utilisateurs d'effectuer des dépôts en cryptomonnaie USDT (Tether) sur le réseau TRON (TRC-20) pour alimenter leurs comptes d'investissement.

## 🏗️ Architecture du Système

### Frontend (React/TypeScript)
- **Modal de paiement** : Interface utilisateur pour initier les paiements
- **Polling automatique** : Vérification du statut toutes les 5 secondes
- **Notifications toast** : Feedback utilisateur en temps réel

### Backend (Django/Python)
- **API REST** : Endpoints pour gérer les transactions
- **Service USDT** : Validation blockchain et monitoring
- **Base de données** : Stockage des transactions et configurations

## 🌐 Endpoints API

### 1. **Initialisation du Paiement**
```http
POST /api/investment/crypto/payment/init/
```
**Utilité** : Créer une nouvelle transaction USDT en base de données

**Headers requis** :
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body** :
```json
{
    "amount": 100,
    "Portfolio": "PHRONESIS"
}
```

**Réponse** :
```json
{
    "transactionId": "USDT-7C517FCCB450",
    "amount": "100.000000",
    "network": "TRC20",
    "walletAddress": "TWuowA7WJRnfv9CoHqtkHkqCPt7MxA6UPN",
    "expiresAt": "2024-01-15T14:30:00Z",
    "portfolio": "PHRONESIS",
    "status": "PENDING"
}
```

### 2. **Validation du Paiement**
```http
POST /api/investment/crypto/payment/verify/
```
**Utilité** : Valider manuellement une transaction avec le hash blockchain

**Headers requis** :
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body** :
```json
{
    "transactionId": "USDT-7C517FCCB450",
    "txHash": "0x123test456"
}
```

**Réponse** :
```json
{
    "success": true,
    "message": "Paiement traité avec succès"
}
```

### 3. **Vérification du Statut**
```http
GET /api/investment/crypto/transaction/{transaction_id}/
```
**Utilité** : Consulter le statut actuel d'une transaction

**Headers requis** :
```http
Authorization: Bearer <JWT_TOKEN>
```

**Réponse** :
```json
{
    "transactionId": "USDT-7C517FCCB450",
    "status": "PAID",
    "amount": "100.000000",
    "createdAt": "2024-01-15T13:15:00Z",
    "expiresAt": "2024-01-15T14:30:00Z",
    "paidAt": "2024-01-15T13:45:00Z",
    "txnHash": "0x123test456"
}
```

### 4. **Administration - Liste des Transactions**
```http
GET /api/investment/admin/crypto/transactions/
```
**Utilité** : Consulter toutes les transactions USDT (admin uniquement)

**Paramètres optionnels** :
- `?status=PENDING` : Filtrer par statut
- `?date_from=2024-01-01` : Date de début
- `?date_to=2024-01-31` : Date de fin

**Réponse** :
```json
{
    "transactions": [
        {
            "id": 1,
            "transactionId": "USDT-7C517FCCB450",
            "user": "John Doe",
            "amount": "100.000000",
            "status": "PAID",
            "createdAt": "2024-01-15T13:15:00Z",
            "paidAt": "2024-01-15T13:45:00Z",
            "txnHash": "0x123test456",
            "receivedAmount": "100.000000",
            "senderAddress": "TTestSenderAddress"
        }
    ],
    "total": 1
}
```

### 5. **Endpoints Connexes**

#### Récupération des Portfolios
```http
GET /api/investment/portfolio/
```
**Utilité** : Lister les portfolios disponibles pour sélection

#### Authentification
```http
POST /api/auth/login/
POST /api/token/refresh/
```
**Utilité** : Obtenir les tokens JWT nécessaires

## 🔄 Processus Complet de Paiement

### 1. **Initialisation du Paiement**

#### Frontend
```typescript
// L'utilisateur saisit le montant et sélectionne un portfolio
const data = await AccountService.payWithUSDT(amount, selectedPortfolio);
```

#### Appel API
```http
POST http://127.0.0.1:8000/api/investment/crypto/payment/init/
```

#### Traitement Backend
1. Validation des données (montant, portfolio)
2. Création d'un enregistrement `USDTPayment`
3. Génération d'un `transaction_id` unique
4. Définition de l'expiration (15 minutes)
5. Retour des informations de paiement

### 2. **Affichage des Informations de Paiement**

Le frontend affiche :
- ✅ Montant à payer
- ✅ Adresse de destination
- ✅ QR Code (optionnel)
- ✅ Timer de 15 minutes
- ✅ Instructions de paiement

### 3. **Paiement par l'Utilisateur**

L'utilisateur envoie les USDT depuis son wallet vers l'adresse fournie :
- **Réseau** : TRON (TRC-20)
- **Token** : USDT
- **Adresse** : Celle fournie par le système
- **Montant exact** : Celui demandé

### 4. **Surveillance Automatique**

#### Polling Frontend (toutes les 5 secondes)
```typescript
const checkPaymentStatus = async () => {
    const response = await fetch(
        `http://127.0.0.1:8000/api/investment/crypto/transaction/${transactionId}/`,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        }
    );
    const data = await response.json();
    if (data.status === 'PAID') {
        setStep('success'); // Afficher succès
    }
};
```

#### Monitoring Backend (optionnel)
```bash
python manage.py monitor_blockchain --verbose
```

### 5. **Validation Manuelle (Mode Actuel)**

Un administrateur peut valider manuellement :
```http
POST http://127.0.0.1:8000/api/investment/crypto/payment/verify/
{
    "transactionId": "USDT-7C517FCCB450",
    "txHash": "0x123test456"
}
```

#### Traitement Backend
1. Recherche de la transaction par `transaction_id`
2. Vérification de l'expiration
3. Validation du hash blockchain (mode test ou réel)
4. Mise à jour du statut vers `PAID`
5. Activation du compte utilisateur

### 6. **Validation Blockchain**

Le système vérifie :
- ✅ **Hash de transaction** valide
- ✅ **Montant** correspond
- ✅ **Adresse de destination** correcte
- ✅ **Token USDT** sur réseau TRC-20
- ✅ **Statut** de la transaction

### 7. **Activation du Compte**

Une fois validé :
1. **Statut** : `PENDING` → `PAID`
2. **Crédit du compte** utilisateur
3. **Notification** de confirmation
4. **Redirection** automatique

## 📊 États des Transactions

| Statut | Description | Action Frontend |
|--------|-------------|-----------------|
| `PENDING` | En attente de paiement | Afficher timer + adresse |
| `PAID` | Paiement confirmé | Afficher succès |
| `EXPIRED` | Délai dépassé (15 min) | Retour au formulaire |
| `FAILED` | Erreur de validation | Afficher erreur |

## 🗄️ Structure de Base de Données

### Table `USDTPayment`
```sql
- transaction_id (VARCHAR) : Identifiant unique
- user_id (FK) : Utilisateur
- amount_usdt (DECIMAL) : Montant
- wallet_address (VARCHAR) : Adresse de réception
- status (VARCHAR) : Statut actuel
- portfolio (VARCHAR) : Portfolio choisi
- tx_hash (VARCHAR) : Hash blockchain
- expires_at (DATETIME) : Expiration
- created_at (DATETIME) : Date création
```

### Table `CryptoWalletConfig`
```sql
- network (VARCHAR) : TRC20
- wallet_address (VARCHAR) : Adresse business
- is_active (BOOLEAN) : Actif/Inactif
```

## 🔧 Configuration Requise

### Variables d'Environnement
```env
# Base de données
DB_NAME=atlas_db
DB_USER=atlas_user
DB_PASSWORD=motdepassefort

# APIs Blockchain
TRON_API=https://api.trongrid.io
TRONSCAN_API=https://apilist.tronscanapi.com/api
USDT_CONTRACT=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
```

### Configuration Django
```python
# settings.py
USDT_CONFIG = {
    'BUSINESS_WALLET': 'TYour-Business-Wallet-Address-Here',
    'NETWORK': 'TRC20',
    'CONFIRMATION_BLOCKS': 1,
    'PAYMENT_TIMEOUT_MINUTES': 15,
}
```

## 🚀 Déploiement

### Mode Développement
```bash
# 1. Installer les dépendances
pip install -r requirements.txt

# 2. Migrations
python manage.py migrate

# 3. Créer la configuration wallet
python manage.py shell
>>> from inverstment.models import CryptoWalletConfig
>>> CryptoWalletConfig.objects.create(
...     network='TRC20',
...     wallet_address='VOTRE_ADRESSE_TEST',
...     is_active=True
... )

# 4. Lancer le serveur
python manage.py runserver
```

### Mode Production
```bash
# 1. Configurer la vraie adresse wallet
# 2. Enlever le code de test dans validate_transaction()
# 3. Lancer le monitoring (optionnel)
python manage.py monitor_blockchain --verbose
```

## 🧪 Tests

### Test Manuel (Mode Développement)

#### 1. Créer une transaction
```bash
curl -X POST http://127.0.0.1:8000/api/investment/crypto/payment/init/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "Portfolio": "PHRONESIS"
  }'
```

#### 2. Valider avec hash de test
```bash
curl -X POST http://127.0.0.1:8000/api/investment/crypto/payment/verify/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "USDT-XXXXXXXXXX",
    "txHash": "0x123test456"
  }'
```

#### 3. Vérifier le statut
```bash
curl -X GET http://127.0.0.1:8000/api/investment/crypto/transaction/USDT-XXXXXXXXXX/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Automatisé
```python
# tests.py
def test_usdt_payment_flow():
    # 1. Créer transaction
    # 2. Vérifier statut PENDING
    # 3. Valider avec hash test
    # 4. Vérifier statut PAID
    # 5. Vérifier crédit compte
```

## 🔒 Sécurité

### Validations Implémentées
- ✅ **Authentification** JWT requise
- ✅ **Validation montant** minimum/maximum
- ✅ **Expiration** des transactions (15 min)
- ✅ **Vérification blockchain** complète
- ✅ **Prévention double-dépense**

### Recommandations
- 🔐 Stocker les clés privées de façon sécurisée
- 🔐 Utiliser HTTPS en production
- 🔐 Limiter les tentatives de validation
- 🔐 Logger toutes les transactions

## 📈 Monitoring

### Métriques à Surveiller
- **Transactions par jour**
- **Taux de succès/échec**
- **Temps de validation moyen**
- **Montants traités**

### Logs Importants
```python
# Création transaction
INFO: Transaction USDT-XXX créée pour user_id=123, amount=100

# Validation réussie
INFO: Paiement USDT-XXX validé, hash=0xABC123

# Erreurs
ERROR: Validation échouée pour USDT-XXX: Montant insuffisant
```

## 🆘 Dépannage

### Problèmes Courants

#### Transaction Bloquée en PENDING
- Vérifier l'expiration (15 min max)
- Contrôler le hash de transaction
- Vérifier l'adresse de destination

#### Erreur 500 lors de l'initialisation
- Vérifier la configuration wallet
- Contrôler les permissions utilisateur
- Vérifier la base de données

#### Polling ne fonctionne pas
- Contrôler l'endpoint de statut
- Vérifier l'authentification
- Examiner les erreurs console

### Commandes de Debug
```bash
# Vérifier les transactions en cours
python manage.py shell
>>> from inverstment.models import USDTPayment
>>> USDTPayment.objects.filter(status='PENDING')

# Forcer l'expiration des anciennes transactions
>>> from django.utils import timezone
>>> USDTPayment.objects.filter(
...     status='PENDING',
...     expires_at__lt=timezone.now()
... ).update(status='EXPIRED')
```

## 🔗 URLs Complètes de Référence

### URLs Backend (Django)
```
Base URL: http://127.0.0.1:8000/api/

• POST /investment/crypto/payment/init/           - Initialiser paiement
• POST /investment/crypto/payment/verify/         - Valider paiement  
• GET  /investment/crypto/transaction/{id}/       - Statut transaction
• GET  /investment/admin/crypto/transactions/     - Liste admin
• GET  /investment/portfolio/                     - Liste portfolios
• POST /auth/login/                              - Connexion
• POST /token/refresh/                           - Rafraîchir token
```

### URLs Frontend (React)
```
Base URL: http://localhost:3000/

• /dashboard                    - Tableau de bord
• /investment                  - Page d'investissement
• /payment/usdt                - Modal de paiement USDT
• /transactions                - Historique transactions
```

### APIs Externes
```
• https://api.trongrid.io                        - API officielle TRON
• https://apilist.tronscanapi.com/api            - TronScan API
• Contract USDT: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
```

## 📞 Support

Pour toute question technique :
1. Consulter les logs Django
2. Vérifier la configuration blockchain
3. Tester avec les endpoints de debug
4. Contacter l'équipe de développement

### Endpoints de Debug
```bash
# Vérifier la santé de l'API
curl http://127.0.0.1:8000/api/investment/portfolio/

# Tester l'authentification
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -d '{"email":"test@test.com", "password":"password"}'

# Vérifier les transactions en cours
curl -H "Authorization: Bearer TOKEN" \
  http://127.0.0.1:8000/api/investment/admin/crypto/transactions/?status=PENDING
```

---

**Version** : 1.0  
**Dernière mise à jour** : Décembre 2024  
**Auteur** : Équipe Atlas Backend