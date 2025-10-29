import React, { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const WelcomeMessage: React.FC = () => {
  const [show, setShow] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Afficher le message de bienvenue après la connexion
    const timer = setTimeout(() => {
      setShow(true);
    }, 500);

    // Masquer automatiquement après 5 secondes
    const hideTimer = setTimeout(() => {
      setShow(false);
    }, 5500);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!show || !user) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className="bg-white dark:bg-slate-800 border border-green-200 dark:border-green-800 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Connexion réussie !
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Bienvenue {user.firstName}, vous êtes maintenant connecté à Phronesis Capital.
            </p>
          </div>
          <button
            onClick={() => setShow(false)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage;