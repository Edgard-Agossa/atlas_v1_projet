
import { useState, useEffect } from 'react';
import { Portfolio, PortfolioType } from '../types';
import API_BASE_URL from '../config/api';

export const usePortfolioData = () => {
const [portfolios, setPortfolios] = useState<{ [key in PortfolioType]: Portfolio }>({
  PHRONESIS: {} as Portfolio,
  FLAGSHIP: {} as Portfolio,
});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolios = async () => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/investment/portfolios/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolios');
      }

      const rawPortfolios = await response.json();
const processedPortfolios: { [key in PortfolioType]: Portfolio } = {
  PHRONESIS: {} as Portfolio,
  FLAGSHIP: {} as Portfolio,
};

      for (const p of rawPortfolios) {
        processedPortfolios[p.type as PortfolioType] = {
          id: p.id.toString(),
          name: p.name,
          type: p.type as PortfolioType,
          holdings: [], // Will be fetched separately or from holdings hook
          cash: p.cash,
          totalValue: p.total_value,
          totalGainLoss: 0, // Calculate based on holdings
          totalGainLossPercent: 0, // Calculate based on holdings
          owner: p.owner,
          lastUpdated: p.last_updated,
        };
      }

      setPortfolios(processedPortfolios);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  return {
    portfolios,
    loading,
    error,
    refetch: fetchPortfolios,
  };
};
