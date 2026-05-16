import React, { useState, useEffect } from 'react';
import { Edit, Search, Filter, RefreshCw, Users, TrendingUp, DollarSign, CheckCircle, XCircle, Shield } from 'lucide-react';
import EditMemberAccountModal from '../components/EditMemberAccountModal';
import PinCodeModal from '../components/PinCodeModal';
import API_BASE_URL from '../config/api';

interface MemberAccount {
  id: number;
  account_number: string;
  member_external_id: string;
  member_id: number;
  member_name: string;
  email: string;
  telephone: string;
  date_entree: string;
  balance: number;
  shares_count: number;
  gross_value: number;
  promesse_annuelle: number;
  frais_gestion: number;
  capital_net: number;
  parts_pct: number;
  profit_type: string;
  portfolio_type: string;
  portfolio_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_modified_by: string | null;
  last_modification_date: string | null;
}

const AdminMemberAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<MemberAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<MemberAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPortfolio, setFilterPortfolio] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<MemberAccount | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinValidated, setPinValidated] = useState(false);

  // Vérifier si le PIN est déjà validé dans cette session
  useEffect(() => {
    const validated = sessionStorage.getItem('accounts_pin_validated');
    const validatedPin = sessionStorage.getItem('accounts_pin_validated_code');
    if (validated === 'true' && validatedPin) {
      setPinValidated(true);
      fetchAccounts(validatedPin);
    } else {
      setIsPinModalOpen(true);
    }
  }, []);

  const fetchAccounts = async (validatedPin?: string) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      // Utiliser le PIN validé ou celui stocké en session
      const pinCode = validatedPin || sessionStorage.getItem('accounts_pin_validated_code');
      
      const response = await fetch(`${API_BASE_URL}/investment/admin/accounts/all/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pin_code: pinCode }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAccounts(data.accounts);
        setFilteredAccounts(data.accounts);
      } else {
        setError(data.error || 'Erreur lors du chargement des comptes');
      }
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSuccess = (pinCode: string) => {
    setPinValidated(true);
    setIsPinModalOpen(false);
    fetchAccounts(pinCode);
  };

  // Filtrage
  useEffect(() => {
    let filtered = accounts;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (acc) =>
          acc.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          acc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          acc.member_external_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          acc.account_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par portfolio
    if (filterPortfolio !== 'all') {
      filtered = filtered.filter((acc) => acc.portfolio_type === filterPortfolio);
    }

    // Filtre par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter((acc) =>
        filterStatus === 'active' ? acc.is_active : !acc.is_active
      );
    }

    setFilteredAccounts(filtered);
  }, [searchTerm, filterPortfolio, filterStatus, accounts]);

  const handleEdit = (account: MemberAccount) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAccount(null);
  };

  const handleSuccess = () => {
    fetchAccounts();
  };

  // Statistiques
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalGrossValue = accounts.reduce((sum, acc) => sum + acc.gross_value, 0);
  const activeAccounts = accounts.filter((acc) => acc.is_active).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement des comptes...</p>
        </div>
      </div>
    );
  }

  if (!pinValidated) {
    return (
      <PinCodeModal
        isOpen={isPinModalOpen}
        onClose={() => window.history.back()}
        onSuccess={handlePinSuccess}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Gestion des Comptes Membres
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Visualisez et modifiez tous les comptes membres
          </p>
        </div>
        <button
          onClick={() => {
            const validatedPin = sessionStorage.getItem('accounts_pin_validated_code');
            if (validatedPin) {
              fetchAccounts(validatedPin);
            }
          }}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base"
        >
          <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Actualiser
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Total Comptes</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {accounts.length}
              </p>
            </div>
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 flex-shrink-0" />
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Comptes Actifs</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{activeAccounts}</p>
            </div>
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 flex-shrink-0" />
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Total Versé</p>
              <p className="text-base sm:text-2xl font-bold text-gray-900 dark:text-white mt-1 truncate">
                {formatCurrency(totalBalance)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 flex-shrink-0" />
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Valeur Totale</p>
              <p className="text-base sm:text-2xl font-bold text-gray-900 dark:text-white mt-1 truncate">
                {formatCurrency(totalGrossValue)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="card p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Recherche */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filtre Portfolio */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <select
              value={filterPortfolio}
              onChange={(e) => setFilterPortfolio(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
            >
              <option value="all">Tous les portfolios</option>
              <option value="PHRONESIS">Phronesis</option>
              <option value="FLAGSHIP">FlagShip</option>
            </select>
          </div>

          {/* Filtre Statut */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {filteredAccounts.length} compte(s) trouvé(s)
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="card p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm sm:text-base text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Tableau Desktop / Cartes Mobile */}
      <div className="card overflow-hidden">
        {/* Version Desktop - Tableau */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Membre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID / Portfolio
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Montant Versé
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Parts
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Valeur Nette
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Dernière Modif.
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {account.member_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {account.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {account.member_external_id || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {account.portfolio_type}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {formatCurrency(account.balance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {account.shares_count.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(account.gross_value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {account.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {account.last_modified_by ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {account.last_modified_by}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(account.last_modification_date || '')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">Aucune</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleEdit(account)}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAccounts.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Aucun compte trouvé</p>
            </div>
          )}
        </div>

        {/* Version Mobile - Cartes */}
        <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {filteredAccounts.map((account) => (
            <div key={account.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              {/* En-tête de la carte */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {account.member_name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {account.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {account.member_external_id || 'N/A'}
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {account.portfolio_type}
                    </span>
                  </div>
                </div>
                {account.is_active ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 ml-2">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Actif
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 ml-2">
                    <XCircle className="w-3 h-3 mr-1" />
                    Inactif
                  </span>
                )}
              </div>

              {/* Données financières */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Montant Versé</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(account.balance)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Parts</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {account.shares_count.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Valeur Nette</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(account.gross_value)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Dernière Modif.</p>
                  {account.last_modified_by ? (
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {account.last_modified_by}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(account.last_modification_date || '')}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500">Aucune</p>
                  )}
                </div>
              </div>

              {/* Bouton d'action */}
              <button
                onClick={() => handleEdit(account)}
                className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4 mr-1" />
                Modifier
              </button>
            </div>
          ))}

          {filteredAccounts.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Aucun compte trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'édition */}
      <EditMemberAccountModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        account={selectedAccount}
        onSuccess={handleSuccess}
      />

      {/* Modal PIN */}
      <PinCodeModal
        isOpen={isPinModalOpen}
        onClose={() => window.history.back()}
        onSuccess={handlePinSuccess}
      />
    </div>
  );
};

export default AdminMemberAccounts;
