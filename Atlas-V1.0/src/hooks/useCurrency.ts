import { useState, useEffect, useCallback } from 'react';
import { Currency, fetchRates } from '../utils/currency';

const REFRESH_INTERVAL_MS = 60 * 60 * 1000; // 1 heure

interface UseCurrencyReturn {
  rates: Record<Currency, number>;
  loading: boolean;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export const useCurrency = (): UseCurrencyReturn => {
  const [rates, setRates]           = useState<Record<Currency, number>>({ XOF: 1, EUR: 1 / 655.957, USD: 1 / 600 });
  const [loading, setLoading]       = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const newRates = await fetchRates();
    setRates(newRates);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  // Chargement initial
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Rafraîchissement automatique toutes les heures
  useEffect(() => {
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  return { rates, loading, lastUpdated, refresh };
};
