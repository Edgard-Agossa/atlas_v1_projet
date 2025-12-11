import { useState, useEffect } from 'react';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Interface qui correspond EXACTEMENT au modèle Django
export interface HoldingData {
  id: number;
  asset: string;
  symbol: string;
  name: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  portfolio: string;
  sector: string;
  asset_type: string;
  last_updated: string;
}

export const useHoldingDataSimple = () => {
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
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Holdings reçus:', data);
      // S'assurer que data est un tableau
      const holdingsArray = Array.isArray(data) ? data : (data.results || []);
      setHoldings(holdingsArray);
      setError(null);
    } catch (err) {
      console.error('Erreur fetch:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const createHolding = async (holdingData: Omit<HoldingData, 'id' | 'last_updated'>) => {
    const token = localStorage.getItem('token');
    console.log('🔑 Token:', token ? 'Présent' : 'Manquant');
    
    if (!token) {
      throw new Error('Token d\'authentification manquant. Veuillez vous reconnecter.');
    }
    
    try {
      console.log('📤 Création holding:', holdingData);
      
      const response = await fetch(`${API_BASE_URL}/investment/holdings/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(holdingData),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur serveur:', errorText);
        
        if (response.status === 401) {
          throw new Error('Token expiré. Veuillez vous reconnecter.');
        }
        
        // Parser les erreurs de validation Django
        try {
          const errorData = JSON.parse(errorText);
          const errorMessages: string[] = [];
          
          for (const [field, messages] of Object.entries(errorData)) {
            if (Array.isArray(messages)) {
              const fieldName = field === 'symbol' ? 'Symbole' : 
                               field === 'asset' ? 'Asset' :
                               field === 'name' ? 'Nom' :
                               field === 'quantity' ? 'Quantité' :
                               field === 'avg_price' ? 'Prix moyen' :
                               field === 'current_price' ? 'Prix actuel' :
                               field === 'sector' ? 'Secteur' : field;
              
              messages.forEach((msg: string) => {
                if (msg.includes('no more than 10 characters')) {
                  errorMessages.push(`${fieldName}: Maximum 10 caractères autorisés`);
                } else if (msg.includes('This field is required')) {
                  errorMessages.push(`${fieldName}: Ce champ est obligatoire`);
                } else {
                  errorMessages.push(`${fieldName}: ${msg}`);
                }
              });
            }
          }
          
          if (errorMessages.length > 0) {
            throw new Error(errorMessages.join('\n'));
          }
        } catch (parseError) {
          // Si on ne peut pas parser, utiliser le message brut
        }
        
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const newHolding = await response.json();
      console.log('✅ Holding créé:', newHolding);
      
      await fetchHoldings(); // Actualiser la liste
      return newHolding;
    } catch (err) {
      console.error('❌ Erreur création:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchHoldings();
  }, []);

  const updateHolding = async (id: number, holdingData: Partial<HoldingData>) => {
    const token = localStorage.getItem('token');
    try {
      console.log('Mise à jour holding:', id, holdingData);
      
      const response = await fetch(`${API_BASE_URL}/investment/holdings/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(holdingData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur serveur:', errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const updatedHolding = await response.json();
      console.log('Holding mis à jour:', updatedHolding);
      
      await fetchHoldings(); // Actualiser la liste
      return updatedHolding;
    } catch (err) {
      console.error('Erreur mise à jour:', err);
      throw err;
    }
  };

  const deleteHolding = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      console.log('Suppression holding:', id);
      
      const response = await fetch(`${API_BASE_URL}/investment/holdings/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur serveur:', errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      console.log('Holding supprimé');
      await fetchHoldings(); // Actualiser la liste
    } catch (err) {
      console.error('Erreur suppression:', err);
      throw err;
    }
  };

  return {
    holdings,
    loading,
    error,
    refetch: fetchHoldings,
    createHolding,
    updateHolding,
    deleteHolding,
  };
};