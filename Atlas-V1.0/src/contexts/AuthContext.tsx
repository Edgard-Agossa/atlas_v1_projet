import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'member';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Données utilisateur simulées
const MOCK_USER: User = {
  id: '1',
  email: 'edgardagossa5@gmail.com',
  firstName: 'Edgard',
  lastName: 'Agossa',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    const savedUser = localStorage.getItem('phronesis_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('phronesis_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulation d'une requête API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Vérification des identifiants
    if (email === 'edgardagossa5@gmail.com' && password === '123') {
      setUser(MOCK_USER);
      localStorage.setItem('phronesis_user', JSON.stringify(MOCK_USER));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulation d'une requête API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Créer un nouvel utilisateur
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'member'
    };
    
    setUser(newUser);
    localStorage.setItem('phronesis_user', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('phronesis_user');
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