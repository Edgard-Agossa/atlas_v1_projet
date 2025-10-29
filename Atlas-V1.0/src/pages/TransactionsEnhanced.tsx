import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  Calendar,
  Filter,
  Download,
  Search,
  TrendingUp,
  TrendingDown,
  Plus
} from 'lucide-react';
import { Transaction, TransactionType, PortfolioType } from '../types';

interface TransactionsProps {
  transactions: Transaction[];
  addTransaction?: (transaction: Omit<Transaction, 'id'>) => void;
}

const TransactionsEnhanced: React.FC<TransactionsProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'ALL'>('ALL');
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioType | 'ALL'>('ALL');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
      case TransactionType.BUY:
      case TransactionType.DIVIDEND:
        return <ArrowDownLeft className="w-5 h-5 text-success-600" />;
      case TransactionType.WITHDRAWAL:
      case TransactionType.SELL:
        return <ArrowUpRight className="w-5 h-5 text-danger-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
      case TransactionType.BUY:
      case TransactionType.DIVIDEND:
        return 'text-success-600';
      case TransactionType.WITHDRAWAL:
      case TransactionType.SELL:
        return 'text-danger-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTransactionLabel = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return 'Dépôt';
      case TransactionType.WITHDRAWAL:
        return 'Retrait';
      case TransactionType.BUY:
        return 'Achat';
      case TransactionType.SELL:
        return 'Vente';
      case TransactionType.DIVIDEND:
        return 'Dividende';
      default:
        return type;
    }
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.asset?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'ALL') {
      filtered = filtered.filter(t => t.type === selectedType);
    }

    // Filter by portfolio
    if (selectedPortfolio !== 'ALL') {
      filtered = filtered.filter(t => t.portfolio === selectedPortfolio);
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const days = parseInt(dateRange.replace('d', ''));
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filtered = filtered.filter(t => new Date(t.date) >= cutoffDate);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, selectedType, selectedPortfolio, dateRange]);

  const stats = useMemo(() => {
    const totalIn = filteredTransactions
      .filter(t => [TransactionType.DEPOSIT, TransactionType.DIVIDEND].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalOut = filteredTransactions
      .filter(t => [TransactionType.WITHDRAWAL].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalTrades = filteredTransactions
      .filter(t => [TransactionType.BUY, TransactionType.SELL].includes(t.type))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { totalIn, totalOut, totalTrades, count: filteredTransactions.length };
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Historique de toutes les transactions du club
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
          <button className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle transaction
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Entrées
              </p>
              <p className="text-2xl font-bold text-success-600 mt-2">
                {formatCurrency(stats.totalIn)}
              </p>
            </div>
            <div className="p-3 bg-success-100 dark:bg-success-900/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-success-600 dark:text-success-400" />
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
                Sorties
              </p>
              <p className="text-2xl font-bold text-danger-600 mt-2">
                {formatCurrency(stats.totalOut)}
              </p>
            </div>
            <div className="p-3 bg-danger-100 dark:bg-danger-900/20 rounded-xl">
              <TrendingDown className="w-6 h-6 text-danger-600 dark:text-danger-400" />
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
                Volume trades
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(stats.totalTrades)}
              </p>
            </div>
            <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-primary-600 dark:text-primary-400" />
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
                Transactions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.count}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as TransactionType | 'ALL')}
            className="input-field"
          >
            <option value="ALL">Tous les types</option>
            <option value={TransactionType.DEPOSIT}>Dépôts</option>
            <option value={TransactionType.WITHDRAWAL}>Retraits</option>
            <option value={TransactionType.BUY}>Achats</option>
            <option value={TransactionType.SELL}>Ventes</option>
            <option value={TransactionType.DIVIDEND}>Dividendes</option>
          </select>
          
          <select
            value={selectedPortfolio}
            onChange={(e) => setSelectedPortfolio(e.target.value as PortfolioType | 'ALL')}
            className="input-field"
          >
            <option value="ALL">Tous les portefeuilles</option>
            <option value={PortfolioType.PHRONESIS}>Phronesis</option>
            <option value={PortfolioType.FLAGSHIP}>FlagShip</option>
          </select>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d' | 'all')}
            className="input-field"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
            <option value="all">Toutes les dates</option>
          </select>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
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
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Asset/Description
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Portefeuille
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <div>{new Date(transaction.date).toLocaleDateString('fr-FR')}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTransactionIcon(transaction.type)}
                      <span className={`ml-2 text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                        {getTransactionLabel(transaction.type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    <div>
                      <div className="font-medium">
                        {transaction.asset || 'Liquidités'}
                      </div>
                      {transaction.description && (
                        <div className="text-xs text-gray-500 mt-1">
                          {transaction.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {transaction.quantity || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {transaction.price ? formatCurrency(transaction.price) : '-'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                    {formatCurrency(Math.abs(transaction.amount))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.portfolio === PortfolioType.PHRONESIS
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300'
                        : 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300'
                    }`}>
                      {transaction.portfolio === PortfolioType.PHRONESIS ? 'Phronesis' : 'FlagShip'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              Aucune transaction trouvée avec les filtres actuels
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TransactionsEnhanced;