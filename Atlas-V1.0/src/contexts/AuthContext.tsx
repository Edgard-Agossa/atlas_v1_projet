import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import API_BASE_URL from '../config/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'member';
  avatar?: string;
  phone?: string;
  join_date?: string;
  last_login?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresPasswordChange: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; requiresPasswordChange?: boolean }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  clearPasswordChangeFlag: () => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Helpers ────────────────────────────────────────────────────────────────────

const saveSession = (userData: User, accessToken: string, refreshToken: string) => {
  localStorage.setItem('phronesis_user', JSON.stringify(userData));
  localStorage.setItem('token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

const clearSession = () => {
  localStorage.removeItem('phronesis_user');
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
};

const mapUser = (data: any): User => ({
  id: data.id.toString(),
  email: data.email,
  firstName: data.first_name,
  lastName: data.last_name,
  role: data.role,
  avatar: data.avatar,
  phone: data.phone,
  join_date: data.join_date,
  last_login: data.last_login,
});

// ── Provider ───────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);

  // Restaurer la session au chargement
  useEffect(() => {
    const savedUser = localStorage.getItem('phronesis_user');
    const savedToken = localStorage.getItem('token');
    const savedPasswordChangeFlag = localStorage.getItem('requires_password_change');
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setRequiresPasswordChange(savedPasswordChangeFlag === 'true');
      } catch {
        clearSession();
      }
    }
    setIsLoading(false);
  }, []);

  // Écouter la déconnexion forcée déclenchée par apiFetch (refresh échoué)
  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null);
      clearSession();
    };
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; requiresPasswordChange?: boolean }> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = mapUser(data.user);
        setUser(userData);
        saveSession(userData, data.access_token, data.refresh_token);
        
        // Gérer le flag de changement de mot de passe
        const needsPasswordChange = data.requires_password_change || false;
        setRequiresPasswordChange(needsPasswordChange);
        localStorage.setItem('requires_password_change', needsPasswordChange.toString());
        
        setIsLoading(false);
        return { success: true, requiresPasswordChange: needsPasswordChange };
      }

      setIsLoading(false);
      return { success: false, error: data.error || 'Erreur de connexion' };
    } catch {
      setIsLoading(false);
      return { success: false, error: 'Erreur réseau. Vérifiez que le serveur backend est démarré.' };
    }
  };

  const register = async (
    userData: RegisterData
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
          password: userData.password,
          phone: userData.phone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const newUser = mapUser(data.user);
        setUser(newUser);
        saveSession(newUser, data.access_token, data.refresh_token);

        // Créer automatiquement les comptes après inscription
        try {
          const { AccountService } = await import('./DataUrl');
          await AccountService.createMemberAccounts(parseInt(newUser.id));
        } catch (accountError) {
          console.warn('Erreur création comptes (non bloquante):', accountError);
        }

        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: data.error || "Erreur lors de l'inscription" };
    } catch {
      setIsLoading(false);
      return { success: false, error: 'Erreur réseau. Vérifiez que le serveur backend est démarré.' };
    }
  };

  const logout = () => {
    setUser(null);
    setRequiresPasswordChange(false);
    clearSession();
    localStorage.removeItem('requires_password_change');
  };

  const clearPasswordChangeFlag = () => {
    setRequiresPasswordChange(false);
    localStorage.removeItem('requires_password_change');
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        requiresPasswordChange,
        login, 
        register, 
        logout,
        clearPasswordChangeFlag
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
