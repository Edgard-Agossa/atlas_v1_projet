// Utilitaires pour l'authentification

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 3) {
    return { isValid: false, message: 'Le mot de passe doit contenir au moins 3 caractères' };
  }
  
  return { isValid: true };
};

export const formatUserName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Simulation d'une API de vérification d'email
export const checkEmailExists = async (email: string): Promise<boolean> => {
  // Simulation d'une requête API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Pour la démo, on considère que seul l'email de test existe
  return email === 'edgardagossa5@gmail.com';
};

// Génération d'un token JWT simulé
export const generateToken = (userId: string): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    userId, 
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24h
  }));
  const signature = btoa(`signature_${userId}_${Date.now()}`);
  
  return `${header}.${payload}.${signature}`;
};

// Vérification d'un token JWT simulé
export const verifyToken = (token: string): { isValid: boolean; userId?: string } => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { isValid: false };
    
    const payload = JSON.parse(atob(parts[1]));
    
    if (payload.exp < Date.now()) {
      return { isValid: false };
    }
    
    return { isValid: true, userId: payload.userId };
  } catch {
    return { isValid: false };
  }
};