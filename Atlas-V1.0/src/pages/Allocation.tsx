import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  Target,
  RotateCcw,
  Settings,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const Allocation: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'current' | 'target' | 'rebalance'>('current');
  const [selectedPortfolio, setSelectedPortfolio] = useState<'combined' | 'phronesis' | 'flagship'>('combined');

  // Données d'allocation actuelles
  const currentAllocation = {
    combined: {
      stocks: { value: 85000, percent: 66.7, target: 70 },
      bonds: { value: 25000, percent: 19.6, target: 20 },
      reits: { value: 12000, percent: 9.4, target: 7 },
      cash: { value: 5450, percent: 4.3, target: 3 }
    },
    phronesis: {
      stocks: { value: 45000, percent: 70.3, target: 75 },
      bonds: { value: 15000, percent: 23.4, target: 20 },
      reits: { value: 4000, percent: 6.3, target: 5 }
    },
    flagship: {
      stocks: { value: 40000, percent: 62.5, target: 65 },
      bonds: { value: 10000, percent: 15.6, target: 20 },
      reits: { value: 8000, percent: 12.5, target: 10 },
      cash: { value: 5450, percent: 8.5, target: 5 }
    }
  };

  const totalValue = 127450;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const getDeviationColor = (current: number, target: number) => {
    const deviation = Math.abs(current - target);
    if (deviation <= 1) return 'text-green-600';
    if (deviation <= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDeviationIcon = (current: number, target: number) => {
    const deviation = Math.abs(current - target);
    if (deviation <= 1) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (deviation <= 3) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  const allocationData = currentAllocation[selectedPortfolio];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Allocation d'Actifs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
            Gérez et optimisez la répartition de vos investissements
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button className="btn-secondary flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </button>
          <button className="btn-secondary flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
          <button className="btn-primary flex items-center">
            <RotateCcw className="w-4 h-4 mr-2" />
            Rééquilibrer
          </button>
        </div>
      </div>

      {/* Portfolio Selector */}
      <div className="card p-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Portefeuille :
          </label>
          <select
            value={selectedPortfolio}
            onChange={(e) => setSelectedPortfolio(e.target.value as any)}
            className="input-field"
          >
            <option value="combined">Combiné (Phronesis + FlagShip)</option>
            <option value="phronesis">Phronesis (Passif)</option>
            <option value="flagship">FlagShip (Actif)</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Valeur Totale
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <PieChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                Classes d'Actifs
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {Object.keys(allocationData).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
              <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
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
                Écart Moyen
              </p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                2.1%
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
              <Target className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Dernière MAJ
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                Aujourd'hui
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
              <RefreshCw className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Allocation Chart & Table */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Répartition Actuelle
          </h3>
          <div className="relative">
            <div className="w-64 h-64 mx-auto">
              {/* Simplified pie chart representation */}
              <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500 relative">
                <div className="absolute inset-8 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(totalValue)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {Object.entries(allocationData).map(([key, data]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    key === 'stocks' ? 'bg-blue-500' :
                    key === 'bonds' ? 'bg-green-500' :
                    key === 'reits' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {key === 'stocks' ? 'Actions' :
                     key === 'bonds' ? 'Obligations' :
                     key === 'reits' ? 'REITs' : 'Liquidités'}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {data.percent.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Allocation Table */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Analyse d'Allocation
          </h3>
          <div className="space-y-4">
            {Object.entries(allocationData).map(([key, data]) => (
              <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                    {key === 'stocks' ? 'Actions' :
                     key === 'bonds' ? 'Obligations' :
                     key === 'reits' ? 'REITs' : 'Liquidités'}
                  </h4>
                  {getDeviationIcon(data.percent, data.target)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Valeur</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(data.value)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Actuel</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {data.percent.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Cible</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {data.target}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Écart</span>
                    <span className={`font-medium ${getDeviationColor(data.percent, data.target)}`}>
                      {(data.percent - data.target).toFixed(1)}%
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                    <div 
                      className={`h-2 rounded-full ${
                        key === 'stocks' ? 'bg-blue-500' :
                        key === 'bonds' ? 'bg-green-500' :
                        key === 'reits' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(data.percent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Rebalancing Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Recommandations de Rééquilibrage
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Actions Suggérées</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="text-sm text-red-800 dark:text-red-300">Réduire Actions</span>
                <span className="text-sm font-medium text-red-800 dark:text-red-300">-€2,850</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm text-green-800 dark:text-green-300">Augmenter Obligations</span>
                <span className="text-sm font-medium text-green-800 dark:text-green-300">+€1,200</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <span className="text-sm text-yellow-800 dark:text-yellow-300">Réduire REITs</span>
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">-€3,050</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Impact Estimé</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Écart moyen après</span>
                <span className="text-sm font-medium text-green-600">0.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Frais estimés</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">€45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Temps optimal</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Cette semaine</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Allocation;