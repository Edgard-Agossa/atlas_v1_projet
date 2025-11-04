import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useHoldingData, HoldingData } from '../hooks/useHoldingData';
import { PortfolioType } from '../types';

interface HoldingManagerProps {
  portfolios: { [key in PortfolioType]: any };
}

const HoldingManager: React.FC<HoldingManagerProps> = ({ portfolios }) => {
  const {
    holdings,
    loading,
    error,
    createHolding,
    updateHolding,
    deleteHolding,
    togglePublic
  } = useHoldingData();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingHolding, setEditingHolding] = useState<HoldingData | null>(null);
  const [formData, setFormData] = useState<Partial<HoldingData>>({
    asset: '',
    symbol: '',
    name: '',
    quantity: 0,
    avg_price: 0,
    current_price: 0,
    portfolio: '',
    sector: 'Technology',
    asset_type: 'stock',
    is_public: false,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const calculateGain = (holding: HoldingData) => {
    const marketValue = holding.quantity * holding.current_price;
    const costBasis = holding.quantity * holding.avg_price;
    const gain = marketValue - costBasis;
    const gainPercent = costBasis > 0 ? (gain / costBasis) * 100 : 0;
    return { gain, gainPercent, marketValue };
  };

  const handleCreate = async () => {
    try {
      await createHolding(formData as Omit<HoldingData, 'id' | 'last_updated' | 'owner_username' | 'portfolio_name'>);
      setShowCreateForm(false);
      resetForm();
    } catch (err) {
      console.error('Error creating holding:', err);
    }
  };

  const handleUpdate = async () => {
    if (!editingHolding) return;
    try {
      await updateHolding(editingHolding.id, formData);
      setEditingHolding(null);
      resetForm();
    } catch (err) {
      console.error('Error updating holding:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet actif ?')) {
      try {
        await deleteHolding(id);
      } catch (err) {
        console.error('Error deleting holding:', err);
      }
    }
  };

  const handleTogglePublic = async (id: string) => {
    try {
      await togglePublic(id);
    } catch (err) {
      console.error('Error toggling public status:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      asset: '',
      symbol: '',
      name: '',
      quantity: 0,
      avg_price: 0,
      current_price: 0,
      portfolio: '',
      sector: 'Technology',
      asset_type: 'stock',
      is_public: false,
    });
  };

  const startEdit = (holding: HoldingData) => {
    setEditingHolding(holding);
    setFormData({ ...holding });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Erreur: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestion des Actifs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gérez vos actifs avec contrôle d'accès et visibilité publique
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un Actif
        </button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingHolding) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-semibold mb-4">
            {editingHolding ? 'Modifier l\'Actif' : 'Ajouter un Actif'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Symbole</label>
              <input
                type="text"
                value={formData.symbol || ''}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value, asset: e.target.value })}
                className="input-field"
                placeholder="AAPL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Apple Inc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantité</label>
              <input
                type="number"
                value={formData.quantity || ''}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                className="input-field"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prix Moyen</label>
              <input
                type="number"
                value={formData.avg_price || ''}
                onChange={(e) => setFormData({ ...formData, avg_price: parseFloat(e.target.value) })}
                className="input-field"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prix Actuel</label>
              <input
                type="number"
                value={formData.current_price || ''}
                onChange={(e) => setFormData({ ...formData, current_price: parseFloat(e.target.value) })}
                className="input-field"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Portefeuille</label>
              <select
                value={formData.portfolio || ''}
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                className="input-field"
              >
                <option value="">Sélectionner un portefeuille</option>
                {Object.values(portfolios).map((portfolio: any) => (
                  <option key={portfolio.id} value={portfolio.id}>
                    {portfolio.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Secteur</label>
              <input
                type="text"
                value={formData.sector || ''}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type d'Actif</label>
              <select
                value={formData.asset_type || 'stock'}
                onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
                className="input-field"
              >
                <option value="stock">Action</option>
                <option value="etf">ETF</option>
                <option value="bond">Obligation</option>
                <option value="reit">REIT</option>
                <option value="crypto">Crypto</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public || false}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="is_public" className="text-sm font-medium">
                Rendre public
              </label>
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              onClick={editingHolding ? handleUpdate : handleCreate}
              className="btn-primary"
            >
              {editingHolding ? 'Modifier' : 'Créer'}
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setEditingHolding(null);
                resetForm();
              }}
              className="btn-secondary"
            >
              Annuler
            </button>
          </div>
        </motion.div>
      )}

      {/* Holdings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actif
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Prix Moyen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Prix Actuel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Valeur Marché
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Gain/Perte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Propriétaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Public
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {holdings.map((holding) => {
                const { gain, gainPercent, marketValue } = calculateGain(holding);
                return (
                  <motion.tr
                    key={holding.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {holding.symbol}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {holding.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {holding.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(holding.avg_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(holding.current_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(marketValue)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      gain >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <div className="flex items-center">
                        {gain >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {formatCurrency(gain)} ({formatPercent(gainPercent)})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {holding.owner_username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        holding.is_public
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                      }`}>
                        {holding.is_public ? 'Public' : 'Privé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleTogglePublic(holding.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          title={holding.is_public ? 'Rendre privé' : 'Rendre public'}
                        >
                          {holding.is_public ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => startEdit(holding)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(holding.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default HoldingManager;
