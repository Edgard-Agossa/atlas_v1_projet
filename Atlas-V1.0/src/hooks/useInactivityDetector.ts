import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInactivityDetectorOptions {
  inactivityTimeout?: number; // Temps avant le modal (en ms)
  warningDuration?: number;   // Durée du compte à rebours (en ms)
  onLogout: () => void;        // Callback de déconnexion
  enabled?: boolean;            // Activer/désactiver le détecteur
}

/**
 * Hook personnalisé pour détecter l'inactivité de l'utilisateur
 * et afficher un modal de confirmation avant déconnexion automatique
 */
export const useInactivityDetector = ({
  inactivityTimeout = 5 * 60 * 1000,  // 5 minutes par défaut
  warningDuration = 2 * 60 * 1000,     // 2 minutes par défaut
  onLogout,
  enabled = true,
}: UseInactivityDetectorOptions) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(warningDuration / 1000); // en secondes

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Nettoyer tous les timers
  const clearAllTimers = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Démarrer le compte à rebours de 2 minutes
  const startWarning = useCallback(() => {
    setShowWarning(true);
    setTimeLeft(warningDuration / 1000);

    // Compte à rebours
    countdownIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearAllTimers();
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Timer de déconnexion automatique après 2 minutes
    warningTimerRef.current = setTimeout(() => {
      clearAllTimers();
      onLogout();
    }, warningDuration);
  }, [warningDuration, onLogout, clearAllTimers]);

  // Réinitialiser le timer d'inactivité
  const resetInactivityTimer = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    lastActivityRef.current = Date.now();

    if (!enabled) return;

    // Redémarrer le timer d'inactivité
    inactivityTimerRef.current = setTimeout(() => {
      startWarning();
    }, inactivityTimeout);
  }, [inactivityTimeout, enabled, startWarning, clearAllTimers]);

  // L'utilisateur confirme qu'il est toujours là
  const handleStayConnected = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Événements de détection d'activité
  useEffect(() => {
    if (!enabled) {
      clearAllTimers();
      return;
    }

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Throttle pour éviter trop d'appels
    let throttleTimeout: NodeJS.Timeout | null = null;
    const handleActivity = () => {
      // Ne pas réinitialiser si le modal est déjà affiché
      if (showWarning) return;

      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          resetInactivityTimer();
          throttleTimeout = null;
        }, 1000); // Throttle de 1 seconde
      }
    };

    // Ajouter les écouteurs d'événements
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Démarrer le timer initial
    resetInactivityTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (throttleTimeout) clearTimeout(throttleTimeout);
      clearAllTimers();
    };
  }, [enabled, showWarning, resetInactivityTimer, clearAllTimers]);

  // Nettoyer au démontage
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    showWarning,
    timeLeft,
    handleStayConnected,
    handleLogout: onLogout,
  };
};
