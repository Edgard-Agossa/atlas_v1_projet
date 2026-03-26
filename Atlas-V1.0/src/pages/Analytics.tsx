import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { PerformanceDataPoint, Portfolio, PortfolioType, Transaction, TransactionType } from '../types';
import StatCard from '../components/ui/StatCard';

interface AnalyticsProps {
  performanceHistory: PerformanceDataPoint[];
  portfolios: { [key in PortfolioType]: Portfolio };
  transactions: Transaction[];
}

const Analytics: React.FC<AnalyticsProps> = ({ 
  performanceHistory, 
  portfolios, 
  transactions 
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const totalValue = Object.values(portfolios).reduce((sum, p) => sum + p.totalValue, 0);
    const totalGainLoss = Object.values(portfolios).reduce((sum, p) => sum + p.totalGainLoss, 0);
    const totalGainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

    // Monthly performance data
    const monthlyData = performanceHistory.slice(-12).map(point => ({
      month: new Date(point.date).toLocaleDateString('fr-FR', { month: 'short' }),
      performance: point.nav,
      benchmark: point.benchmark,
      value: point.portfolioValue
    }));

    // Portfolio allocation
    const allocationData = Object.values(portfolios).map(portfolio => ({
      name: portfolio.name,
      value: portfolio.totalValue,
      percentage: (portfolio.totalValue / totalValue) * 100,
      color: portfolio.type === PortfolioType.PHRONESIS ? '#3b82f6' : '#10b981'
    }));

    // Asset type distribution
    const assetTypes = new Map<string, number>();
    Object.values(portfolios).forEach(portfolio => {
      portfolio.holdings.forEach(holding => {
        const current = assetTypes.get(holding.assetType) || 0;
        assetTypes.set(holding.assetType, current + holding.marketValue);
      });
    });

    const assetDistribution = Array.from(assetTypes.entries()).map(([type, value]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value,
      percentage: (value / totalValue) * 100
    }));

    // Transaction volume by month
    const transactionsByMonth = new Map<string, { deposits: number; withdrawals: number; trades: number }>();
    transactions.forEach(transaction => {
      const month = new Date(transaction.date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      const current = transactionsByMonth.get(month) || { deposits: 0, withdrawals: 0, trades: 0 };
      
      if (transaction.type === TransactionType.DEPOSIT) {
        current.deposits += transaction.amount;
      } else if (transaction.type === TransactionType.WITHDRAWAL) {
        current.withdrawals += transaction.amount;
      } else if ([TransactionType.BUY, TransactionType.SELL].includes(transaction.type)) {
        current.trades += Math.abs(transaction.amount);
      }
      
      transactionsByMonth.set(month, current);
    });

    const transactionVolumeData = Array.from(transactionsByMonth.entries())
      .slice(-6)
      .map(([month, data]) => ({
        month,
        deposits: data.deposits,
        withdrawals: data.withdrawals,
        trades: data.trades
      }));

    return {
      totalValue,
      totalGainLoss,
      totalGainLossPercent,
      monthlyData,
      allocationData,
      assetDistribution,
      transactionVolumeData
    };
  }, [performanceHistory, portfolios, transactions]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Analyses détaillées des performances et de la répartition
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Valeur totale"
          value={formatCurrency(analyticsData.totalValue)}
          icon={DollarSign}
          delay={0}
        />
        <StatCard
          label="Performance"
          value={formatPercent(analyticsData.totalGainLossPercent)}
          icon={analyticsData.totalGainLossPercent >= 0 ? TrendingUp : TrendingDown}
          iconBg={analyticsData.totalGainLossPercent >= 0 ? 'bg-success-100 dark:bg-success-900/20' : 'bg-danger-100 dark:bg-danger-900/20'}
          iconColor={analyticsData.totalGainLossPercent >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}
          valueColor={analyticsData.totalGainLossPercent >= 0 ? 'text-success-600' : 'text-danger-600'}
          delay={0.1}
        />
        <StatCard
          label="Gain/Perte"
          value={formatCurrency(analyticsData.totalGainLoss)}
          icon={Target}
          iconBg="bg-warning-100 dark:bg-warning-900/20"
          iconColor="text-warning-600 dark:text-warning-400"
          valueColor={analyticsData.totalGainLoss >= 0 ? 'text-success-600' : 'text-danger-600'}
          delay={0.2}
        />
        <StatCard
          label="Positions"
          value={Object.values(portfolios).reduce((sum, p) => sum + p.holdings.length, 0)}
          icon={Activity}
          iconBg="bg-purple-100 dark:bg-purple-900/20"
          iconColor="text-purple-600 dark:text-purple-400"
          delay={0.3}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Performance mensuelle
            </h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === 'performance' ? `${value.toFixed(2)}%` : formatCurrency(value),
                  name === 'performance' ? 'Performance' : name === 'benchmark' ? 'Benchmark' : 'Valeur'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="performance" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="benchmark" 
                stroke="#6b7280" 
                fill="#6b7280" 
                fillOpacity={0.05}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Portfolio Allocation */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Répartition des portefeuilles
            </h3>
            <PieChartIcon className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.allocationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {analyticsData.allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {analyticsData.allocationData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.value)}
                  </span>
                  <div className="text-xs text-gray-500">
                    {item.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Asset Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Répartition par type d'actif
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.assetDistribution} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Transaction Volume */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Volume des transactions
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.transactionVolumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Bar dataKey="deposits" stackId="a" fill="#10b981" name="Dépôts" />
              <Bar dataKey="withdrawals" stackId="a" fill="#ef4444" name="Retraits" />
              <Bar dataKey="trades" stackId="a" fill="#3b82f6" name="Trades" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-success-500 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">Dépôts</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-danger-500 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">Retraits</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary-500 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">Trades</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Résumé des performances
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(portfolios).map((portfolio, index) => (
            <div key={portfolio.id} className="text-center">
              <div className={`inline-flex p-3 rounded-xl mb-3 ${
                portfolio.type === PortfolioType.PHRONESIS
                  ? 'bg-primary-100 dark:bg-primary-900/20'
                  : 'bg-success-100 dark:bg-success-900/20'
              }`}>
                <Activity className={`w-6 h-6 ${
                  portfolio.type === PortfolioType.PHRONESIS
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-success-600 dark:text-success-400'
                }`} />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {portfolio.name}
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Valeur: </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(portfolio.totalValue)}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Performance: </span>
                  <span className={`font-medium ${
                    portfolio.totalGainLossPercent >= 0 ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    {formatPercent(portfolio.totalGainLossPercent)}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Positions: </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {portfolio.holdings.length}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;