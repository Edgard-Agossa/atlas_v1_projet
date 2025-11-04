import React, { useState } from 'react';
import { Holding, PortfolioType } from '../types';

interface AddAssetModalProps {
  onClose: () => void;
  onAddAsset: (asset: Omit<Holding, 'id' | 'marketValue' | 'unrealizedGain' | 'unrealizedGainLoss' | 'unrealizedGainPercent' | 'lastUpdated'>) => void;
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({ onClose, onAddAsset }) => {
  const [newAsset, setNewAsset] = useState({
    asset: '',
    symbol: '',
    name: '',
    quantity: 0,
    avgPrice: 0,
    averageCost: 0,
    currentPrice: 0,
    portfolio: PortfolioType.PHRONESIS,
    sector: '',
    assetType: 'stock' as 'stock' | 'etf' | 'bond' | 'reit' | 'crypto',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;
    if (['quantity', 'avgPrice', 'currentPrice'].includes(name)) {
      processedValue = parseFloat(value) || 0;
    }
    setNewAsset(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Transform to API format (snake_case)
    const apiAsset = {
      asset: newAsset.asset,
      symbol: newAsset.symbol,
      name: newAsset.name,
      quantity: newAsset.quantity,
      avg_price: newAsset.avgPrice,
      current_price: newAsset.currentPrice,
      portfolio: newAsset.portfolio,
      sector: newAsset.sector,
      asset_type: newAsset.assetType,
    };
    onAddAsset(apiAsset as any); // Temporary cast to bypass type check
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Ajouter un nouvel actif</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="asset" placeholder="Asset (e.g., AAPL)" onChange={handleChange} className="input-field" required />
            <input type="text" name="symbol" placeholder="Symbole" onChange={handleChange} className="input-field" required />
            <input type="text" name="name" placeholder="Nom de l'entreprise" onChange={handleChange} className="input-field" required />
            <input type="number" name="quantity" placeholder="Quantité" onChange={handleChange} className="input-field" required />
            <input type="number" name="avgPrice" placeholder="Prix moyen d'achat" onChange={handleChange} className="input-field" required />
            <input type="number" name="currentPrice" placeholder="Prix actuel" onChange={handleChange} className="input-field" required />
            <select name="portfolio" onChange={handleChange} className="input-field" required>
              <option value={PortfolioType.PHRONESIS}>Phronesis</option>
              <option value={PortfolioType.FLAGSHIP}>FlagShip</option>
            </select>
            <input type="text" name="sector" placeholder="Secteur" onChange={handleChange} className="input-field" required />
            <select name="assetType" onChange={handleChange} className="input-field" required>
              <option value="stock">Action</option>
              <option value="etf">ETF</option>
              <option value="bond">Obligation</option>
              <option value="reit">REIT</option>
              <option value="crypto">Crypto</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAssetModal;
