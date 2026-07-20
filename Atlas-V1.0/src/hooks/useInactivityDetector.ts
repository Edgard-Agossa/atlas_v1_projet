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
  warningDuration = 20 * 1000,         // 20 secondes par défaut
  onLogout,
  enabled = true,
}: UseInactivityDetectorOptions) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(Math.floor(warningDuration / 1000));

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Démarrer le compte à rebours du modal
  const startWarning = useCallback(() => {
    setShowWarning(true);
    const initialSeconds = Math.floor(warningDuration / 1000);
    setTimeLeft(initialSeconds);

    let currentTime = initialSeconds;

    // Compte à rebours chaque seconde
    countdownIntervalRef.current = setInterval(() => {
      currentTime -= 1;
      setTimeLeft(currentTime);

      if (currentTime <= 0) {
        clearAllTimers();
        setShowWarning(false);
        onLogout();
      }
    }, 1000);

    // Timer de déconnexion automatique (backup)
    warningTimerRef.current = setTimeout(() => {
      clearAllTimers();
      setShowWarning(false);
      onLogout();
    }, warningDuration);
  }, [warningDuration, onLogout, clearAllTimers]);

  // Réinitialiser le timer d'inactivité
  const resetInactivityTimer = useCallback(() => {
    // Nettoyer les anciens timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    if (!enabled) return;

    // Démarrer un nouveau timer d'inactivité
    inactivityTimerRef.current = setTimeout(() => {
      startWarning();
    }, inactivityTimeout);
  }, [inactivityTimeout, enabled, startWarning]);

  // L'utilisateur confirme qu'il est toujours là
  const handleStayConnected = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    resetInactivityTimer();
  }, [clearAllTimers, resetInactivityTimer]);

  // Gérer les événements d'activité utilisateur
  useEffect(() => {
    if (!enabled) {
      clearAllTimers();
      setShowWarning(false);
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

    let throttleTimeout: NodeJS.Timeout | null = null;

    const handleActivity = () => {
      // Ignorer l'activité si le modal est affiché
      if (showWarning) return;

      // Throttle pour éviter trop de resets
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          resetInactivityTimer();
          throttleTimeout = null;
        }, 1000);
      }
    };

    // Ajouter les écouteurs d'événements
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Démarrer le timer initial uniquement si le modal n'est pas affiché
    if (!showWarning) {
      resetInactivityTimer();
    }

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [enabled, showWarning, resetInactivityTimer]);

  // Nettoyer au démontage du composant
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    showWarning,
    timeLeft,
    handleStayConnected,
  };
};
