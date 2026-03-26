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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    const savedUser = localStorage.getItem('phronesis_user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('phronesis_user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData: User = {
          id: data.user.id.toString(),
          email: data.user.email,
          firstName: data.user.first_name,
          lastName: data.user.last_name,
          role: data.user.role,
          avatar: data.user.avatar,
          phone: data.user.phone,
          join_date: data.user.join_date,
          last_login: data.user.last_login,
        };

        setUser(userData);
        localStorage.setItem('phronesis_user', JSON.stringify(userData));
        localStorage.setItem('token', data.access_token); // Stocker le token JWT
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: data.error || 'Erreur de connexion' };
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setIsLoading(false);
      return { success: false, error: 'Erreur réseau. Vérifiez que le serveur backend est démarré.' };
    }
  };

  // const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
  //   setIsLoading(true);

  //   try {
  //     const response = await fetch(`${API_BASE_URL}/auth/register/`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         first_name: userData.firstName,
  //         last_name: userData.lastName,
  //         email: userData.email,
  //         password: userData.password,
  //         phone: userData.phone,
  //       }),
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       const newUser: User = {
  //         id: data.user.id.toString(),
  //         email: data.user.email,
  //         firstName: data.user.first_name,
  //         lastName: data.user.last_name,
  //         role: data.user.role,
  //         avatar: data.user.avatar,
  //         phone: data.user.phone,
  //         join_date: data.user.join_date,
  //       };
          
  //       setUser(newUser);
  //       localStorage.setItem('phronesis_user', JSON.stringify(newUser));
  //       localStorage.setItem('token', data.access_token); // Stocker le token JWT
  //       setIsLoading(false);
  //       return { success: true };
  //     } else {
  //       setIsLoading(false);
  //       return { success: false, error: data.error || 'Erreur lors de l\'inscription' };
  //     }
  //   } catch (error) {
  //     console.error('Erreur lors de l\'inscription:', error);
  //     setIsLoading(false);
  //     return { success: false, error: 'Erreur réseau. Vérifiez que le serveur backend est démarré.' };
  //   }
  // };



  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
  setIsLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
      const newUser: User = {
        id: data.user.id.toString(),
        email: data.user.email,
        firstName: data.user.first_name,
        lastName: data.user.last_name,
        role: data.user.role,
        avatar: data.user.avatar,
        phone: data.user.phone,
        join_date: data.user.join_date,
      };

      setUser(newUser);
      localStorage.setItem('phronesis_user', JSON.stringify(newUser));
      localStorage.setItem('token', data.access_token);

      // ✅ Créer automatiquement les comptes après inscription
      try {
        const { AccountService } = await import('./DataUrl');
        await AccountService.createMemberAccounts(parseInt(newUser.id));
        console.log('Comptes créés automatiquement pour le nouvel utilisateur');
      } catch (accountError) {
        console.warn('Erreur création comptes (non bloquante):', accountError);
      }

      setIsLoading(false);
      return { success: true };
    } else {
      setIsLoading(false);
      return { success: false, error: data.error || 'Erreur lors de l\'inscription' };
    }
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    setIsLoading(false);
    return { success: false, error: 'Erreur réseau. Vérifiez que le serveur backend est démarré.' };
  }
};

  const logout = () => {
    setUser(null);
    localStorage.removeItem('phronesis_user');
    localStorage.removeItem('token');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
