#!/bin/bash
# ─── Script de déploiement Atlas ─────────────────────────────────────────────
# Usage : bash deploy.sh
# À exécuter sur le SERVEUR après un git pull

set -e  # Arrêter si une commande échoue

PROJECT_DIR="/var/www/atlas_v1_projet"
BACKEND_DIR="$PROJECT_DIR/atlas_backend"
FRONTEND_DIR="$PROJECT_DIR/Atlas-V1.0"
VENV_DIR="$PROJECT_DIR/venv"

echo "🚀 Déploiement Atlas en cours..."

# ── 1. Pull du code ───────────────────────────────────────────────────────────
echo "📥 Récupération du code..."
cd $PROJECT_DIR
git pull origin winner_kiro

# ── 2. Backend Django ─────────────────────────────────────────────────────────
echo "🐍 Mise à jour du backend..."
cd $BACKEND_DIR
source $VENV_DIR/bin/activate
pip install -r requirements.txt --quiet
python3 manage.py migrate --noinput
python3 manage.py collectstatic --noinput --clear
systemctl restart atlas
echo "✅ Backend redémarré"

# ── 3. Frontend React ─────────────────────────────────────────────────────────
echo "⚛️  Build du frontend..."
cd $FRONTEND_DIR
npm install --silent
npm run build
systemctl reload nginx
echo "✅ Frontend déployé"

echo ""
echo "🎉 Déploiement terminé avec succès !"
echo "🌐 Site disponible sur votre domaine"
