import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Globe,
  Lock,
  Upload
} from 'lucide-react';
import { useHoldingDataSimple } from '../hooks/useHoldingDataSimple';
import AddAssetModalSimple from '../components/AddAssetModalSimple';
import { useAuth } from '../contexts/AuthContext';
import ExcelUploadModal from '../components/ExcelUploadModal';

const PortfolioSimple: React.FC = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { holdings, loading, error, createHolding, updateHolding, deleteHolding } = useHoldingDataSimple();
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<'ALL' | 'PHRONESIS' | 'FLAGSHIP'>('ALL');
  const [sortBy, setSortBy] = useState<'value' | 'gain' | 'symbol'>('value');
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

  // --- DONNÉES EN DUR POUR LE MEMBRE (Mock Data) ---

  const [memberInvestments, setMemberInvestments] = useState<any[]>([]);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token:', token ? 'Présent' : 'Absent');

        const response = await fetch('http://127.0.0.1:8080/api/investment/member/investments/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Données reçues:', data);

        if (data.success) {
          console.log('Nombre d\'investissements:', data.investments.length);
          setMemberInvestments(data.investments);
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchInvestments();
  }, []);

  const handleAddAsset = async (assetData: any) => {
    try {
      await createHolding(assetData);
      setIsAddAssetModalOpen(false);
      window.alert('Actif ajouté avec succès!');
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      window.alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  // Calculs simples basés sur les données réelles du modèle
  const holdingsArray = Array.isArray(holdings) ? holdings : [];

  // Filtrage et tri
  const filteredHoldings = holdingsArray
    .filter(holding => selectedPortfolio === 'ALL' || holding.portfolio === selectedPortfolio)
    .sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return (b.quantity * b.current_price) - (a.quantity * a.current_price);
        case 'gain':
          const gainA = (a.quantity * a.current_price) - (a.quantity * a.avg_price);
          const gainB = (b.quantity * b.current_price) - (b.quantity * b.avg_price);
          return gainB - gainA;
        case 'symbol':
          return a.symbol.localeCompare(b.symbol);
        default:
          return 0;
      }
    });

  const totalValue = filteredHoldings.reduce((sum, h) => sum + (h.quantity * h.current_price), 0);
  const totalCost = filteredHoldings.reduce((sum, h) => sum + (h.quantity * h.avg_price), 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  const handleEdit = (holding: any) => {
    console.log('Éditer:', holding);
    // TODO: Ouvrir modal d'édition
    window.alert('Fonction d\'\u00e9dition à implémenter');
  };

  const handleDelete = async (holding: any) => {
    if (window.confirm(`Supprimer ${holding.symbol} ?`)) {
      try {
        await deleteHolding(holding.id);
        window.alert('Actif supprimé avec succès');
      } catch (error) {
        window.alert('Erreur lors de la suppression');
        console.error(error);
      }
    }
  };

  const handleTogglePublic = (holding: any) => {
    console.log('Toggle public:', holding);
    // TODO: Implémenter toggle public
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Symbol,Name,Quantity,Avg Price,Current Price,Value,Gain\n" +
      filteredHoldings.map(h => {
        const value = h.quantity * h.current_price;
        const gain = value - (h.quantity * h.avg_price);
        return `${h.symbol},${h.name},${h.quantity},${h.avg_price},${h.current_price},${value},${gain}`;
      }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "portfolio.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Erreur: {error}</div>
      </div>
    );
  }

  // --- FONCTION : TABLEAU VUE MEMBRE (Design Jaune Attrayant) ---
  const renderMemberTable = () => (
    <div className="overflow-x-auto border-2 border-yellow-500 rounded-xl shadow-2xl [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-yellow-500 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-yellow-600 [&::-webkit-scrollbar]:opacity-0 hover:[&::-webkit-scrollbar]:opacity-100 [&::-webkit-scrollbar]:transition-opacity">
      <div className="min-w-max">
        <table className="w-full border-collapse">
          <thead className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-black sticky top-0 z-10">
            <tr className="divide-x-2 divide-yellow-600">
              <th className="px-4 py-4 text-xs font-extrabold uppercase border-b-2 border-yellow-600 whitespace-nowrap tracking-wide">N°</th>
              <th className="px-4 py-4 text-xs font-extrabold uppercase border-b-2 border-yellow-600 whitespace-nowrap tracking-wide">ID membre</th>
              <th className="px-4 py-4 text-xs font-extrabold uppercase border-b-2 border-yellow-600 text-left whitespace-nowrap tracking-wide">Nom & prénom</th>
              <th className="px-4 py-4 text-xs font-extrabold uppercase border-b-2 border-yellow-600 text-left whitespace-nowrap tracking-wide">Email</th>
              <th className="px-4 py-4 text-xs font-extrabold uppercase border-b-2 border-yellow-600 whitespace-nowrap tracking-wide">Téléphone</th>
              <th className="px-4 py-4 text-xs font-extrabold uppercase border-b-2 border-yellow-600 whitespace-nowrap tracking-wide">Date d'entrée</th>
              <th className="px-4 py-4 text-xs font-extrabold uppercase border-b-2 border-yellow-600 whitespace-nowrap tracking-wide">Date versement</th>
              <th className="px-4 py-4 text-xs font-extrabold uppercase border-b-2 border-yellow-600 text-right whitespace-nowrap tracking-wide">Promesse<br />Annuelle</th>
              <th className="px-4 py-4 text-xs font-extrabold uppercase border-b-2 border-yellow-600 text-right whitespace-nowrap tracking-wide">Montant<br />versé</th>
              <th className="px-4 py-4 text-xs font-extrabold uppercase border-b-2 border-yellow-600 text-right whitespace-nowrap tracking-wide">Frais de<br />gestion</th>
              <th className="px-4 py-4 text-xs font-extrabold uppercase border-b-2 border-yellow-600 text-right whitespace-nowrap tracking-wide">Capital investi<br />(exlus frais)</th>
              <th className="px-4 py-4 text-xs font-extrabold uppercase border-b-2 border-yellow-600 text-right whitespace-nowrap tracking-wide">Parts<br />détenues (%)</th>
              <th className="px-4 py-4 text-xs font-extrabold uppercase border-b-2 border-yellow-600 whitespace-nowrap tracking-wide">Nbre<br />de part</th>
              <th className="px-4 py-4 text-xs font-extrabold uppercase border-b-2 border-yellow-600 text-right whitespace-nowrap tracking-wide">Valeur<br />nette</th>
              <th className="px-4 py-4 text-xs font-extrabold uppercase border-b-2 border-yellow-600 whitespace-nowrap tracking-wide">Statut<br />Portfolio</th>
              <th className="px-4 py-4 text-xs font-extrabold uppercase border-b-2 border-yellow-600 whitespace-nowrap tracking-wide">Profit<br />Type</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {memberInvestments.map((inv, idx) => (
              <tr key={inv.id} className="divide-x divide-gray-300 hover:bg-yellow-50 transition-all duration-200 border-b border-gray-200">
                <td className="px-4 py-5 text-sm text-center font-bold whitespace-nowrap bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900">{idx + 1}</td>
                <td className="px-4 py-5 text-sm font-semibold whitespace-nowrap text-gray-800">{inv.member_external_id}</td>
                <td className="px-4 py-5 text-sm uppercase whitespace-nowrap font-semibold text-gray-900">{user?.firstName} {user?.lastName}</td>
                <td className="px-4 py-5 text-sm whitespace-nowrap text-gray-700">{inv.email}</td>
                <td className="px-4 py-5 text-sm text-center whitespace-nowrap text-gray-700">{inv.telephone}</td>
                <td className="px-4 py-5 text-sm text-center whitespace-nowrap text-gray-700">{inv.date_entree}</td>
                <td className="px-4 py-5 text-sm text-center whitespace-nowrap text-gray-700">-</td>
                <td className="px-4 py-5 text-sm text-right font-bold whitespace-nowrap text-blue-700">-</td>
                <td className="px-4 py-5 text-sm text-right font-bold whitespace-nowrap text-green-700">{formatCurrency(inv.balance)}</td>
                <td className="px-4 py-5 text-sm text-right font-bold text-red-600 whitespace-nowrap bg-red-50">-</td>
                <td className="px-4 py-5 text-sm text-right font-extrabold whitespace-nowrap text-indigo-700">{formatCurrency(inv.balance)}</td>
                <td className="px-4 py-5 text-sm text-right font-bold whitespace-nowrap text-purple-700">-</td>
                <td className="px-4 py-5 text-sm text-center font-bold whitespace-nowrap text-gray-900">{inv.shares_count.toFixed(2)}</td>
                <td className="px-4 py-5 text-sm text-right font-extrabold text-green-700 bg-gradient-to-r from-green-50 to-green-100 whitespace-nowrap text-lg">{formatCurrency(inv.gross_value)}</td>
                <td className="px-4 py-5 text-sm text-center whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full shadow-md ${inv.is_active
                      ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                      : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                    }`}>
                    {inv.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-4 py-5 text-sm text-center whitespace-nowrap font-semibold text-gray-800">{inv.portfolio_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Indicateur de scroll sur mobile */}
      <div className="block sm:hidden text-center py-3 text-xs font-semibold text-gray-600 bg-gradient-to-r from-yellow-100 to-yellow-200 border-t-2 border-yellow-500">
        👈 Faites défiler horizontalement pour voir plus 👉
      </div>
    </div>
  );

  // --- FONCTION : TABLEAU VUE ADMIN (Standard) ---
  const renderAdminTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asset</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Portefeuille</th>
            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantité</th>
            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prix moyen</th>
            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prix actuel</th>
            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valeur</th>
            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gain/Perte</th>
            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {filteredHoldings.map((holding, index) => {
            const marketValue = holding.quantity * holding.current_price;
            const costBasis = holding.quantity * holding.avg_price;
            const gain = marketValue - costBasis;
            const gainPercent = costBasis > 0 ? (gain / costBasis) * 100 : 0;

            return (
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
                      <span className="text-white font-bold text-sm">{holding.symbol.substring(0, 2)}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{holding.symbol}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{holding.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${holding.portfolio === 'PHRONESIS'
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300'
                      : 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300'
                    }`}>
                    {holding.portfolio === 'PHRONESIS' ? 'Phronesis' : 'FlagShip'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">{holding.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">{formatCurrency(holding.avg_price)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">{formatCurrency(holding.current_price)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(marketValue)}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${gain >= 0 ? 'text-success-600' : 'text-danger-600'
                  }`}>
                  {formatCurrency(gain)} ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" onClick={() => handleEdit(holding)} title="Éditer">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" onClick={() => handleDelete(holding)} title="Supprimer">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
      {filteredHoldings.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Aucun actif dans votre portefeuille. Ajoutez votre premier actif !</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header dynamique */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portefeuille</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {user?.role === 'admin' ? "Gestion des actifs de la plateforme" : "Mes investissements personnels"}
          </p>
        </div>
        {user?.role === 'admin' && (

          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button className="btn-secondary flex items-center" onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />Importer Excel
            </button>

            <button className="btn-secondary flex items-center" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />Filtrer
            </button>
            <button className="btn-secondary flex items-center" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />Exporter
            </button>
            <button className="btn-primary flex items-center" onClick={() => setIsAddAssetModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />Ajouter un actif
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards - Uniquement pour Admin */}
      {user?.role === 'admin' && (
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
                <p className={`text-2xl font-bold mt-2 ${totalGain >= 0 ? 'text-success-600' : 'text-danger-600'
                  }`}>
                  {formatCurrency(totalGain)}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${totalGain >= 0
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
                <p className={`text-2xl font-bold mt-2 ${totalGainPercent >= 0 ? 'text-success-600' : 'text-danger-600'
                  }`}>
                  {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
                </p>
              </div>
              <div className={`p-3 rounded-xl ${totalGainPercent >= 0
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
      )}

      {/* Filters - Uniquement pour Admin */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <select
                value={selectedPortfolio}
                onChange={(e) => setSelectedPortfolio(e.target.value as 'ALL' | 'PHRONESIS' | 'FLAGSHIP')}
                className="input-field"
              >
                <option value="ALL">Tous les portefeuilles</option>
                <option value="PHRONESIS">Phronesis (Passif)</option>
                <option value="FLAGSHIP">FlagShip (Actif)</option>
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
        </motion.div>
      )}

      {/* Rendu du tableau admin */}
      {user?.role === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-white dark:bg-gray-900 shadow-xl rounded-xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gestion des Actifs</h2>
          </div>
          {renderAdminTable()}
        </motion.div>
      )}

      {/* Tableau membre (pour tous) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: user?.role === 'admin' ? 0.2 : 0 }}
        className="card bg-white dark:bg-gray-900 shadow-xl rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {user?.role === 'admin' ? 'Mes Investissements Personnels' : 'Mes Investissements'}
          </h2>
        </div>
        {renderMemberTable()}
      </motion.div>

      {/* Modal d'ajout d'actif */}
      {isAddAssetModalOpen && (
        <AddAssetModalSimple
          onClose={() => setIsAddAssetModalOpen(false)}
          onAddAsset={handleAddAsset}
        />
      )}
      {isUploadModalOpen && (
        <ExcelUploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={() => window.location.reload()}
        />
      )}

    </div>
  );
};

export default PortfolioSimple;