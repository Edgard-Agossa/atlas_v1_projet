# Créer le dossier du projet
mkdir atlas_backend && cd atlas_backend

# Créer l'environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Sous Windows :
venv\Scripts\activate
# Sous Linux / macOS :
source venv/bin/activate

# Installer Django
pip install django

# Créer le projet Django (le point à la fin est très important)
django-admin startproject config .


⚙️ 2️⃣ Vérifier la structure obtenue

atlas_backend/
│
├── manage.py
├── venv/
└── config/
    ├── __init__.py
    ├── asgi.py
    ├── settings.py
    ├── urls.py
    └── wsgi.py


⚙️ 3️⃣ Créer les applications internes

# Application d’authentification (login/signup)
python manage.py startapp authentication

# Application d’investissement
python manage.py startapp investment


⚙️ 4️⃣ Ajouter les applications dans settings.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Tes apps
    'authentication',
    'investment',
]


⚙️ 5️⃣ Lancer les migrations par défaut

python manage.py migrate


6️⃣ Créer un superutilisateur (admin)

python manage.py createsuperuser


⚙️ 7️⃣ Lancer le serveur


python manage.py runserver



Django a besoin d’un package Python pour communiquer avec PostgreSQL.


pip install psycopg2-binary


Maintenant atlas_user peut accéder et modifier toutes les tables de atlas_db.

⚙️ 4️⃣ Configurer Django

Même configuration que précédemment, tu peux utiliser un .env pour stocker tes infos sensibles :

# config/settings.py
from decouple import config

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='atlas_db'),
        'USER': config('DB_USER', default='atlas_user'),
        'PASSWORD': config('DB_PASSWORD', default='motdepassefort'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=True, cast=bool)

Et ton .env reste le même :

# .env

DB_NAME=atlas_db
DB_USER=atlas_user
DB_PASSWORD=motdepassefort
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=une_cle_secrete_django
DEBUG=True
