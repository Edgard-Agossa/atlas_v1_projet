dis moi pour mettre ajour les codes chaque jour sur le serveur comment faire ?? apres avoir coder et je veux mettre le code ssur le serveur comment faire ??

11:59
C'est très simple ! Voici le processus au quotidien :

🔄 Workflow de mise à jour
Sur ton PC (après avoir codé)
bash
git add .
git commit -m "Description de ce que tu as fait"
git push origin winner_kiro
Sur le serveur (dans PuTTY)
bash
cd /var/www/atlas_v1_projet
git pull origin winner_kiro
Ensuite ça dépend de ce que tu as modifié :

Si tu as modifié le backend Django
bash
cd atlas_backend
source venv/bin/activate
python3 manage.py migrate          # Seulement si tu as ajouté des modèles
python3 manage.py collectstatic --noinput
systemctl restart atlas
Si tu as modifié le frontend React
bash
cd /var/www/atlas_v1_projet/Atlas-V1.0
npm install        # Seulement si tu as ajouté des packages
npm run build
systemctl reload nginx
Si tu as modifié les deux
bash
# Backend
cd /var/www/atlas_v1_projet/atlas_backend
source venv/bin/activate
python3 manage.py migrate
python3 manage.py collectstatic --noinput
systemctl restart atlas

# Frontend
cd /var/www/atlas_v1_projet/Atlas-V1.0
npm run build
systemctl reload nginx
💡 Résumé simple
Tu codes sur PC → git push → Sur le serveur : git pull → restart