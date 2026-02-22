import React, { useState } from 'react';
import { HoldingData } from '../hooks/useHoldingDataSimple';
import NotificationModal from './NotificationModal';

interface AddAssetModalSimpleProps {
  onClose: () => void;
  onAddAsset: (asset: Omit<HoldingData, 'id' | 'last_updated'>) => Promise<void>;
}

const AddAssetModalSimple: React.FC<AddAssetModalSimpleProps> = ({ onClose, onAddAsset }) => {
  const [formData, setFormData] = useState({
    asset: '',
    symbol: '',
    name: '',
    quantity: '',
    avg_price: '',
    current_price: '',
    portfolio: 'PHRONESIS',
    sector: '',
    asset_type: 'stock',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('📤 Envoi des données depuis le modal:', formData);
      
      // Préparer les données avec conversion des nombres
      const submitData = {
        ...formData,
        quantity: parseFloat(formData.quantity) || 0,
        avg_price: parseFloat(formData.avg_price) || 0,
        current_price: parseFloat(formData.current_price) || 0,
      };
      
      // Vérifier que tous les champs requis sont remplis
      const requiredFields = ['asset', 'symbol', 'name', 'sector'];
      const missingFields = requiredFields.filter(field => !submitData[field as keyof typeof submitData]);
      
      if (missingFields.length > 0) {
        throw new Error(`Champs manquants: ${missingFields.join(', ')}`);
      }
      
      if (submitData.quantity <= 0) {
        throw new Error('La quantité doit être supérieure à 0');
      }
      
      if (submitData.avg_price <= 0 || submitData.current_price <= 0) {
        throw new Error('Les prix doivent être supérieurs à 0');
      }
      
      await onAddAsset(submitData);
      console.log('✅ Actif ajouté avec succès');
      onClose();
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout:', error);
      setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Erreur inconnue' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Ajouter un nouvel actif
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="asset"
              placeholder="Asset (ex: AAPL, max 10 car.)"
              value={formData.asset}
              onChange={handleChange}
              className="input-field"
              maxLength={10}
              required
            />
            <input
              type="text"
              name="symbol"
              placeholder="Symbole (max 10 car.)"
              value={formData.symbol}
              onChange={handleChange}
              className="input-field"
              maxLength={10}
              required
            />
            <input
              type="text"
              name="name"
              placeholder="Nom de l'entreprise"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              required
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantité"
              value={formData.quantity}
              onChange={handleChange}
              className="input-field"
              step="0.0001"
              required
            />
            <input
              type="number"
              name="avg_price"
              placeholder="Prix moyen d'achat"
              value={formData.avg_price}
              onChange={handleChange}
              className="input-field"
              step="0.01"
              required
            />
            <input
              type="number"
              name="current_price"
              placeholder="Prix actuel"
              value={formData.current_price}
              onChange={handleChange}
              className="input-field"
              step="0.01"
              required
            />
            <select
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="PHRONESIS">Phronesis (Passif)</option>
              <option value="FLAGSHIP">FlagShip (Actif)</option>
            </select>
            <input
              type="text"
              name="sector"
              placeholder="Secteur"
              value={formData.sector}
              onChange={handleChange}
              className="input-field"
              required
            />
            <select
              name="asset_type"
              value={formData.asset_type}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="stock">Action</option>
              <option value="etf">ETF</option>
              <option value="bond">Obligation</option>
              <option value="reit">REIT</option>
              <option value="crypto">Crypto</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>

      {notification && (
        <NotificationModal
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default AddAssetModalSimple;