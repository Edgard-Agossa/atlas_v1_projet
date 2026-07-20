import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2 } from 'lucide-react';

interface InactivityModalProps {
  isOpen: boolean;
  onStayConnected: () => void;
  onLogout: () => void;
  timeLeft: number; // en secondes
}

const InactivityModal: React.FC<InactivityModalProps> = ({
  isOpen,
  onStayConnected,
  onLogout,
  timeLeft,
}) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercentage = (timeLeft / 120) * 100; // 120 secondes = 2 minutes

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop élégant */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-50"
          />

          {/* Modal centré */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-200 dark:border-gray-800"
            >
              {/* Contenu */}
              <div className="p-8">
                {/* Icône et titre */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 mb-4">
                    <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Toujours là ?
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Votre session expirera bientôt
                  </p>
                </div>

                {/* Compte à rebours minimaliste */}
                <div className="mb-8">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-baseline gap-1">
                      <span className="text-5xl font-light text-gray-900 dark:text-white tabular-nums">
                        {minutes}:{seconds.toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Barre de progression simple */}
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '100%' }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: 'linear' }}
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                    />
                  </div>
                </div>

                {/* Boutons élégants */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={onStayConnected}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Continuer ma session
                  </motion.button>
                  
                  <button
                    onClick={onLogout}
                    className="w-full px-6 py-3.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 rounded-2xl font-medium transition-colors"
                  >
                    Me déconnecter
                  </button>
                </div>

                {/* Note de sécurité discrète */}
                <p className="text-xs text-center text-gray-400 dark:text-gray-600 mt-6">
                  Déconnexion automatique pour votre sécurité
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InactivityModal;
