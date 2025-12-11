import { useState, useEffect } from 'react';
import { Holding } from '../types';

// const API_BASE_URL = 'http://127.0.0.1:8000/api';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export interface HoldingData {
  id: string;
  asset: string;
  symbol: string;
  name: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  portfolio: string;
  portfolio_name: string;
  sector: string;
  asset_type: string;
  owner: number;
  owner_username: string;
  is_public: boolean;
  last_updated: string;
}

export const useHoldingData = () => {
  const [holdings, setHoldings] = useState<HoldingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHoldings = async () => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/investment/holdings/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch holdings');
      }

      const data = await response.json();
      setHoldings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createHolding = async (holdingData: Omit<HoldingData, 'id' | 'last_updated' | 'owner_username' | 'portfolio_name'>) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/investment/holdings/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(holdingData),
      });

      if (!response.ok) {
        throw new Error('Failed to create holding');
      }

      await fetchHoldings(); // Refresh the list
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  const updateHolding = async (id: string, holdingData: Partial<HoldingData>) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/investment/holdings/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(holdingData),
      });

      if (!response.ok) {
        throw new Error('Failed to update holding');
      }

      await fetchHoldings(); // Refresh the list
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  const deleteHolding = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/investment/holdings/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete holding');
      }

      await fetchHoldings(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  const togglePublic = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/investment/holdings/${id}/toggle-public/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle public status');
      }

      await fetchHoldings(); // Refresh the list
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchHoldings();
  }, []);

  return {
    holdings,
    loading,
    error,
    refetch: fetchHoldings,
    createHolding,
    updateHolding,
    deleteHolding,
    togglePublic,
  };
};
