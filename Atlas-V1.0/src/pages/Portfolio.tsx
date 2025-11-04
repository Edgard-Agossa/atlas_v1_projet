import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Download,
  Eye,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { Holding, PortfolioType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import AddAssetModal from '../components/AddAssetModal';

interface PortfolioProps {
  holdings: Holding[];
  portfolios: { [key in PortfolioType]: any };
  addHolding: (holding: Omit<Holding, 'id' | 'marketValue' | 'unrealizedGain' | 'unrealizedGainLoss' | 'unrealizedGainPercent' | 'lastUpdated'>) => Promise<void>;
}

const Portfolio: React.FC<PortfolioProps> = ({ holdings, portfolios, addHolding }) => {
  const [selectedPortfolio, setSelectedPortfolio] = useState<'ALL' | PortfolioType>('ALL');
  const [sortBy, setSortBy] = useState<'value' | 'gain' | 'symbol'>('value');
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const { user } = useAuth();

  const handleAddAsset = async (asset: Omit<Holding, 'id' | 'marketValue' | 'unrealizedGain' | 'unrealizedGainLoss' | 'unrealizedGainPercent' | 'lastUpdated'>) => {
    await addHolding(asset);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const filteredHoldings = holdings.filter(holding => 
    selectedPortfolio === 'ALL' || holding.portfolio === selectedPortfolio
  ).sort((a, b) => {
    switch (sortBy) {
      case 'value':
        return b.marketValue - a.marketValue;
      case 'gain':
        return b.unrealizedGainPercent - a.unrealizedGainPercent;
      case 'symbol':
        return a.symbol.localeCompare(b.symbol);
      default:
        return 0;
    }
  });

  const totalValue = filteredHoldings.reduce((sum, h) => sum + h.marketValue, 0);
  const totalGain = filteredHoldings.reduce((sum, h) => sum + h.unrealizedGain, 0);
  const totalGainPercent = totalValue > 0 ? (totalGain / (totalValue - totalGain)) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Portefeuille
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gérez vos investissements et suivez leurs performances
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button className="btn-secondary flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filtrer
          </button>
          <button className="btn-secondary flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
          {user?.role === 'admin' && (
            <button 
              className="btn-primary flex items-center"
              onClick={() => setIsAddAssetModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un actif
            </button>
          )}
        </div>
      </div>

      {isAddAssetModalOpen && (
        <AddAssetModal 
          onClose={() => setIsAddAssetModalOpen(false)}
          onAddAsset={handleAddAsset}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Valeur totale
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Gain/Perte
              </p>
              <p className={`text-2xl font-bold mt-2 ${
                totalGain >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {formatCurrency(totalGain)}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${
              totalGain >= 0 
                ? 'bg-success-100 dark:bg-success-900/20' 
                : 'bg-danger-100 dark:bg-danger-900/20'
            }`}>
              {totalGain >= 0 ? (
                <TrendingUp className="w-6 h-6 text-success-600 dark:text-success-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-danger-600 dark:text-danger-400" />
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Rendement
              </p>
              <p className={`text-2xl font-bold mt-2 ${
                totalGainPercent >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {formatPercent(totalGainPercent)}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${
              totalGainPercent >= 0 
                ? 'bg-success-100 dark:bg-success-900/20' 
                : 'bg-danger-100 dark:bg-danger-900/20'
            }`}>
              {totalGainPercent >= 0 ? (
                <TrendingUp className="w-6 h-6 text-success-600 dark:text-success-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-danger-600 dark:text-danger-400" />
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <select
              value={selectedPortfolio}
              onChange={(e) => setSelectedPortfolio(e.target.value as 'ALL' | PortfolioType)}
              className="input-field"
            >
              <option value="ALL">Tous les portefeuilles</option>
              <option value={PortfolioType.PHRONESIS}>Phronesis (Passif)</option>
              <option value={PortfolioType.FLAGSHIP}>FlagShip (Actif)</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'value' | 'gain' | 'symbol')}
              className="input-field"
            >
              <option value="value">Trier par valeur</option>
              <option value="gain">Trier par gain</option>
              <option value="symbol">Trier par symbole</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredHoldings.length} position{filteredHoldings.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Portefeuille
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Prix moyen
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Prix actuel
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Valeur
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Gain/Perte
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  %
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredHoldings.map((holding, index) => (
                <motion.tr
                  key={holding.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {holding.symbol.substring(0, 2)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {holding.symbol}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {holding.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      holding.portfolio === PortfolioType.PHRONESIS
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300'
                        : 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300'
                    }`}>
                      {holding.portfolio === PortfolioType.PHRONESIS ? 'Phronesis' : 'FlagShip'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {holding.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {formatCurrency(holding.avgPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {formatCurrency(holding.currentPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(holding.marketValue)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                    holding.unrealizedGain >= 0 ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    {formatCurrency(holding.unrealizedGain)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                    holding.unrealizedGainPercent >= 0 ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    {formatPercent(holding.unrealizedGainPercent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Portfolio;