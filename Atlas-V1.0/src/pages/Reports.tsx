import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  Eye,
  Share2,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react';
import { Portfolio, PortfolioType, Transaction, Member, PerformanceDataPoint } from '../types';

interface ReportsProps {
  portfolios: { [key in PortfolioType]: Portfolio };
  transactions: Transaction[];
  members: Member[];
  performanceHistory: PerformanceDataPoint[];
}

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  category: 'performance' | 'portfolio' | 'members' | 'transactions';
  generatedDate: string;
  period: string;
  size: string;
  status: 'generated' | 'generating' | 'scheduled';
}

const Reports: React.FC<ReportsProps> = ({ 
  portfolios, 
  transactions, 
  members, 
  performanceHistory 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'performance' | 'portfolio' | 'members' | 'transactions'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'monthly' | 'quarterly' | 'annual'>('all');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  // Generate sample reports based on actual data
  const reports: Report[] = useMemo(() => [
    {
      id: '1',
      title: 'Rapport mensuel de performance',
      description: 'Analyse détaillée des performances du mois en cours',
      type: 'monthly',
      category: 'performance',
      generatedDate: new Date().toISOString(),
      period: 'Décembre 2024',
      size: '2.4 MB',
      status: 'generated'
    },
    {
      id: '2',
      title: 'Répartition du portefeuille',
      description: 'Analyse de la répartition des actifs par secteur et géographie',
      type: 'quarterly',
      category: 'portfolio',
      generatedDate: new Date(Date.now() - 86400000).toISOString(),
      period: 'Q4 2024',
      size: '1.8 MB',
      status: 'generated'
    },
    {
      id: '3',
      title: 'Rapport des membres',
      description: 'Statistiques et évolution des membres du club',
      type: 'monthly',
      category: 'members',
      generatedDate: new Date(Date.now() - 172800000).toISOString(),
      period: 'Novembre 2024',
      size: '1.2 MB',
      status: 'generated'
    },
    {
      id: '4',
      title: 'Historique des transactions',
      description: 'Rapport détaillé de toutes les transactions',
      type: 'quarterly',
      category: 'transactions',
      generatedDate: new Date(Date.now() - 259200000).toISOString(),
      period: 'Q4 2024',
      size: '3.1 MB',
      status: 'generated'
    },
    {
      id: '5',
      title: 'Rapport annuel 2024',
      description: 'Bilan complet de l\'année 2024',
      type: 'annual',
      category: 'performance',
      generatedDate: new Date(Date.now() - 345600000).toISOString(),
      period: '2024',
      size: '5.7 MB',
      status: 'generating'
    },
    {
      id: '6',
      title: 'Analyse des risques',
      description: 'Évaluation des risques du portefeuille',
      type: 'monthly',
      category: 'portfolio',
      generatedDate: new Date(Date.now() - 432000000).toISOString(),
      period: 'Décembre 2024',
      size: '2.1 MB',
      status: 'scheduled'
    }
  ], []);

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const categoryMatch = selectedCategory === 'all' || report.category === selectedCategory;
      const periodMatch = selectedPeriod === 'all' || report.type === selectedPeriod;
      return categoryMatch && periodMatch;
    });
  }, [reports, selectedCategory, selectedPeriod]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalValue = Object.values(portfolios).reduce((sum, p) => sum + p.totalValue, 0);
    const totalGainLoss = Object.values(portfolios).reduce((sum, p) => sum + p.totalGainLoss, 0);
    const activeMembers = members.filter(m => m.status === 'active').length;
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const now = new Date();
      return transactionDate.getMonth() === now.getMonth() && 
             transactionDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      totalValue,
      totalGainLoss,
      activeMembers,
      monthlyTransactions,
      totalReports: reports.length,
      generatedReports: reports.filter(r => r.status === 'generated').length
    };
  }, [portfolios, members, transactions, reports]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance':
        return <TrendingUp className="w-5 h-5" />;
      case 'portfolio':
        return <PieChart className="w-5 h-5" />;
      case 'members':
        return <Users className="w-5 h-5" />;
      case 'transactions':
        return <Activity className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance':
        return 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300';
      case 'portfolio':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300';
      case 'members':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'transactions':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated':
        return 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300';
      case 'generating':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300';
      case 'scheduled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'generated':
        return 'Généré';
      case 'generating':
        return 'En cours';
      case 'scheduled':
        return 'Programmé';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Rapports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Générez et consultez vos rapports d'analyse
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button className="btn-secondary flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filtrer
          </button>
          <button className="btn-primary flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Nouveau rapport
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                {formatCurrency(summaryStats.totalValue)}
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
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Membres actifs
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {summaryStats.activeMembers}
              </p>
            </div>
            <div className="p-3 bg-success-100 dark:bg-success-900/20 rounded-xl">
              <Users className="w-6 h-6 text-success-600 dark:text-success-400" />
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
                Transactions ce mois
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {summaryStats.monthlyTransactions}
              </p>
            </div>
            <div className="p-3 bg-warning-100 dark:bg-warning-900/20 rounded-xl">
              <Activity className="w-6 h-6 text-warning-600 dark:text-warning-400" />
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
                Rapports générés
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {summaryStats.generatedReports}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="input-field"
          >
            <option value="all">Toutes les catégories</option>
            <option value="performance">Performance</option>
            <option value="portfolio">Portefeuille</option>
            <option value="members">Membres</option>
            <option value="transactions">Transactions</option>
          </select>
          
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="input-field"
          >
            <option value="all">Toutes les périodes</option>
            <option value="monthly">Mensuel</option>
            <option value="quarterly">Trimestriel</option>
            <option value="annual">Annuel</option>
          </select>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            {filteredReports.length} rapport{filteredReports.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-lg ${getCategoryColor(report.category)}`}>
                {getCategoryIcon(report.category)}
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                {getStatusLabel(report.status)}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {report.title}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {report.description}
            </p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                {report.period}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <FileText className="w-4 h-4 mr-2" />
                {report.size}
              </div>
              <div className="text-xs text-gray-500">
                Généré le {new Date(report.generatedDate).toLocaleDateString('fr-FR')}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {report.status === 'generated' && (
                <>
                  <button className="btn-secondary flex-1 flex items-center justify-center">
                    <Eye className="w-4 h-4 mr-2" />
                    Voir
                  </button>
                  <button className="btn-secondary flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="btn-secondary flex items-center justify-center">
                    <Share2 className="w-4 h-4" />
                  </button>
                </>
              )}
              {report.status === 'generating' && (
                <div className="flex-1 text-center text-sm text-gray-600 dark:text-gray-400">
                  Génération en cours...
                </div>
              )}
              {report.status === 'scheduled' && (
                <div className="flex-1 text-center text-sm text-gray-600 dark:text-gray-400">
                  Programmé
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Reports;