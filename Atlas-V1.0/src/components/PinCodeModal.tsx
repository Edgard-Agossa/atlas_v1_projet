import React, { useState } from 'react';
import { X, Lock, AlertCircle, Shield } from 'lucide-react';

interface PinCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pinCode: string) => void;
}

const PinCodeModal: React.FC<PinCodeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pinCode, setPinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pinCode || pinCode.length < 4) {
      setError('Veuillez saisir un code PIN valide');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/investment/admin/accounts/all/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pin_code: pinCode }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Stocker le PIN validé dans sessionStorage
        sessionStorage.setItem('accounts_pin_validated', 'true');
        sessionStorage.setItem('accounts_pin_validated_code', pinCode);
        onSuccess(pinCode);
      } else {
        // Code PIN incorrect - incrémenter les tentatives
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          setError(`Trop de tentatives échouées (${MAX_ATTEMPTS}). Accès bloqué.`);
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          setError(`Code PIN incorrect (Tentative ${newAttempts}/${MAX_ATTEMPTS})`);
          setPinCode('');
        }
      }
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setError(`Trop de tentatives échouées (${MAX_ATTEMPTS}). Accès bloqué.`);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError('Erreur réseau. Veuillez réessayer.');
        setPinCode('');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-70 transition-opacity" />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-4">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Accès Sécurisé
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gestion des Comptes Membres
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Alert */}
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-300">
                <p className="font-medium mb-1">Zone Sensible</p>
                <p>
                  Cette section contient des informations financières sensibles. 
                  Veuillez saisir le code PIN pour continuer.
                </p>
              </div>
            </div>

            {/* PIN Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Code PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={pinCode}
                  onChange={(e) => {
                    setPinCode(e.target.value);
                    setError('');
                  }}
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center text-2xl tracking-widest font-mono"
                  placeholder="••••"
                  autoFocus
                  required
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                Saisissez le code PIN fourni par l'administrateur
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`mb-4 p-4 border rounded-lg flex items-center ${
                attempts >= MAX_ATTEMPTS 
                  ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <AlertCircle className={`w-5 h-5 mr-3 ${
                  attempts >= MAX_ATTEMPTS 
                    ? 'text-red-700 dark:text-red-300' 
                    : 'text-red-600 dark:text-red-400'
                }`} />
                <p className={`text-sm ${
                  attempts >= MAX_ATTEMPTS 
                    ? 'text-red-900 dark:text-red-200 font-semibold' 
                    : 'text-red-800 dark:text-red-300'
                }`}>
                  {error}
                </p>
              </div>
            )}

            {/* Indicateur de tentatives */}
            {attempts > 0 && attempts < MAX_ATTEMPTS && (
              <div className="mb-4 flex items-center justify-center space-x-2">
                {[...Array(MAX_ATTEMPTS)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < attempts 
                        ? 'bg-red-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                disabled={attempts >= MAX_ATTEMPTS}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !pinCode || attempts >= MAX_ATTEMPTS}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Valider
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              🔒 Connexion sécurisée • Toutes les actions sont enregistrées
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinCodeModal;
