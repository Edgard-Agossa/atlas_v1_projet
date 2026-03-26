/**
 * apiFetch — wrapper autour de fetch qui gère automatiquement :
 * - L'ajout du header Authorization
 * - Le renouvellement du token JWT si 401
 * - La déconnexion si le refresh échoue
 */

import API_BASE_URL from '../config/api';

let isRefreshing = false;
// File d'attente des requêtes en attente pendant le refresh
let pendingRequests: Array<(token: string) => void> = [];

const notifyPending = (newToken: string) => {
  pendingRequests.forEach((resolve) => resolve(newToken));
  pendingRequests = [];
};

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('phronesis_user');
  // Redirection vers login sans recharger toute l'app
  window.dispatchEvent(new CustomEvent('auth:logout'));
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      clearSession();
      return null;
    }

    const data = await response.json();
    const newAccessToken: string = data.access;

    localStorage.setItem('token', newAccessToken);
    // simplejwt avec ROTATE_REFRESH_TOKENS retourne un nouveau refresh token
    if (data.refresh) {
      localStorage.setItem('refresh_token', data.refresh);
    }

    return newAccessToken;
  } catch {
    clearSession();
    return null;
  }
};

export const apiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('token');

  const headers = new Headers(options.headers);
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(url, { ...options, headers });

  // Token valide — on retourne directement
  if (response.status !== 401) return response;

  // Token expiré — on tente le refresh
  if (isRefreshing) {
    // Une autre requête est déjà en train de refresher, on attend
    return new Promise((resolve) => {
      pendingRequests.push(async (newToken: string) => {
        headers.set('Authorization', `Bearer ${newToken}`);
        resolve(await fetch(url, { ...options, headers }));
      });
    });
  }

  isRefreshing = true;
  const newToken = await refreshAccessToken();
  isRefreshing = false;

  if (!newToken) {
    // Refresh échoué → session terminée
    return response;
  }

  // Notifier les requêtes en attente
  notifyPending(newToken);

  // Rejouer la requête originale avec le nouveau token
  headers.set('Authorization', `Bearer ${newToken}`);
  return fetch(url, { ...options, headers });
};
