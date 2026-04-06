from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .role_views import RoleListCreateView, RoleDetailView, AssignRoleView

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<int:user_id>/', views.UserDetailView.as_view(), name='user-detail'),
    # Gestion des rôles
    path('roles/', RoleListCreateView.as_view(), name='role-list-create'),
    path('roles/<int:role_id>/', RoleDetailView.as_view(), name='role-detail'),
    path('roles/assign/', AssignRoleView.as_view(), name='role-assign'),
]
