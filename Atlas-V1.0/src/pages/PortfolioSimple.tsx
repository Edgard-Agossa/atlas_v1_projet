import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Filter, Download, Plus,
  Edit, Trash2, Upload, Briefcase, DollarSign, BarChart3,
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import AddAssetModalSimple from '../components/AddAssetModalSimple';
import { useAuth } from '../contexts/AuthContext';
import ExcelUploadModal from '../components/ExcelUploadModal';
import Badge from '../components/ui/Badge';
import { Currency, CURRENCY_LABELS, formatCurrency } from '../utils/currency';
import { useCurrency } from '../hooks/useCurrency';

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

const PortfolioSimple: React.FC = () => {
  const { user } = useAuth();
  const {
    holdings, memberInvestments,
    loadingHoldings, loadingMemberInvestments,
    errorHoldings, fetchHoldings, fetchMemberInvestments,
    createHolding, deleteHolding,
  } = useAppStore();

  const [isUploadModalOpen, setIsUploadModalOpen]   = useState(false);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio]   = useState<'ALL' | 'PHRONESIS' | 'FLAGSHIP'>('ALL');
  const [sortBy, setSortBy]                         = useState<'value' | 'gain' | 'symbol'>('value');
  const [showFilters, setShowFilters]               = useState(false);
  const [activeInvTab, setActiveInvTab]             = useState<'ALL' | 'PHRONESIS' | 'FLAGSHIP'>('ALL');
  const [currency, setCurrency]                     = useState<Currency>('XOF');
  const { rates, loading: ratesLoading, lastUpdated, refresh: refreshRates } = useCurrency();

  useEffect(() => {
    fetchHoldings();
    fetchMemberInvestments();
  }, [fetchHoldings, fetchMemberInvestments]);

  // ── Holdings (vue admin) ──────────────────────────────────────────────────
  const filteredHoldings = useMemo(() =>
    (Array.isArray(holdings) ? holdings : [])
      .filter(h => selectedPortfolio === 'ALL' || h.portfolio === selectedPortfolio)
      .sort((a, b) => {
        if (sortBy === 'value') return (b.quantity * b.current_price) - (a.quantity * a.current_price);
        if (sortBy === 'gain')  return ((b.quantity * b.current_price) - (b.quantity * b.avg_price)) - ((a.quantity * a.current_price) - (a.quantity * a.avg_price));
        return a.symbol.localeCompare(b.symbol);
      }),
  [holdings, selectedPortfolio, sortBy]);

  const totalValue       = filteredHoldings.reduce((s, h) => s + h.quantity * h.current_price, 0);
  const totalCost        = filteredHoldings.reduce((s, h) => s + h.quantity * h.avg_price, 0);
  const totalGain        = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  // ── Investissements membre ────────────────────────────────────────────────
  const filteredInvestments = useMemo(() => {
    if (activeInvTab === 'ALL') return memberInvestments;
    return memberInvestments.filter(inv => {
      const type = (inv.portfolio_type || '').toUpperCase().trim();
      if (activeInvTab === 'PHRONESIS') return type === 'PHR' || type === 'PHRONESIS';
      if (activeInvTab === 'FLAGSHIP')  return type === 'FLG' || type === 'FLAGSHIP';
      return false;
    });
  }, [memberInvestments, activeInvTab]);

  // Raccourci formatage avec la devise active et les taux temps réel
  const fmt = (n: number) => formatCurrency(n, currency, rates);

  const invTotalBalance    = filteredInvestments.reduce((s, i) => s + i.balance, 0);
  const invTotalGrossValue = filteredInvestments.reduce((s, i) => s + i.gross_value, 0);
  const invTotalShares     = filteredInvestments.reduce((s, i) => s + i.shares_count, 0);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddAsset = async (assetData: any) => {
    try {
      await createHolding(assetData);
      setIsAddAssetModalOpen(false);
    } catch (err) {
      alert(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  const handleDelete = async (holding: any) => {
    if (!window.confirm(`Supprimer ${holding.symbol} ?`)) return;
    try {
      await deleteHolding(holding.id);
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  const exportData = () => {
    const csv = "data:text/csv;charset=utf-8,Symbol,Name,Quantity,Avg Price,Current Price,Value,Gain\n" +
      filteredHoldings.map(h => {
        const v = h.quantity * h.current_price;
        const g = v - h.quantity * h.avg_price;
        return `${h.symbol},${h.name},${h.quantity},${h.avg_price},${h.current_price},${v},${g}`;
      }).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', 'portfolio.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loadingHoldings || loadingMemberInvestments) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Chargement du portefeuille...</p>
        </div>
      </div>
    );
  }

  if (errorHoldings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-2">Erreur de chargement</p>
          <p className="text-gray-500 text-sm">{errorHoldings}</p>
          <button onClick={fetchHoldings} className="mt-4 btn-primary flex items-center mx-auto">
            <RefreshCw className="w-4 h-4 mr-2" /> Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portefeuille</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.role === 'admin' ? 'Gestion globale des actifs · Phronesis Capital' : 'Mes investissements · Phronesis Capital'}
            </p>
          </div>
        </div>
        {user?.role === 'admin' && (
          <div className="flex flex-wrap items-center gap-2">
            <button className="btn-secondary flex items-center text-xs sm:text-sm py-1.5 px-3" onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="w-3.5 h-3.5 mr-1.5" /> Excel
            </button>
            <button className="btn-secondary flex items-center text-xs sm:text-sm py-1.5 px-3" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-3.5 h-3.5 mr-1.5" /> Filtrer
            </button>
            <button className="btn-secondary flex items-center text-xs sm:text-sm py-1.5 px-3" onClick={exportData}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export
            </button>
            <button className="btn-primary flex items-center text-xs sm:text-sm py-1.5 px-3" onClick={() => setIsAddAssetModalOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Ajouter
            </button>
          </div>
        )}
      </div>

      {/* ── KPI Cards admin ────────────────────────────────────────────────── */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {[
            {
              label: 'Valeur totale',
              value: fmt(totalValue),
              icon: DollarSign,
              color: 'blue',
              sub: `${filteredHoldings.length} position${filteredHoldings.length > 1 ? 's' : ''}`,
            },
            {
              label: 'Gain / Perte',
              value: fmt(totalGain),
              icon: totalGain >= 0 ? TrendingUp : TrendingDown,
              color: totalGain >= 0 ? 'green' : 'red',
              sub: `${totalGain >= 0 ? '+' : ''}${totalGainPercent.toFixed(2)}% vs coût`,
            },
            {
              label: 'Rendement',
              value: `${totalGainPercent >= 0 ? '+' : ''}${totalGainPercent.toFixed(2)}%`,
              icon: BarChart3,
              color: totalGainPercent >= 0 ? 'green' : 'red',
              sub: `Coût : ${fmt(totalCost)}`,
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 sm:p-6 ${i === 2 ? 'col-span-2 lg:col-span-1' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">{card.label}</p>
                  <p className={`text-base sm:text-2xl font-bold truncate ${
                    card.color === 'blue'  ? 'text-blue-600 dark:text-blue-400' :
                    card.color === 'green' ? 'text-emerald-600 dark:text-emerald-400' :
                                             'text-red-500 dark:text-red-400'
                  }`}>{card.value}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1 truncate">{card.sub}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-xl flex-shrink-0 ${
                  card.color === 'blue'  ? 'bg-blue-50 dark:bg-blue-900/20' :
                  card.color === 'green' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                                           'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <card.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${
                    card.color === 'blue'  ? 'text-blue-600 dark:text-blue-400' :
                    card.color === 'green' ? 'text-emerald-600 dark:text-emerald-400' :
                                             'text-red-500 dark:text-red-400'
                  }`} />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 h-0.5 w-full ${
                card.color === 'blue'  ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                card.color === 'green' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                                         'bg-gradient-to-r from-red-400 to-red-600'
              }`} />
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Filtres admin ──────────────────────────────────────────────────── */}
      {showFilters && user?.role === 'admin' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5"
        >
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={selectedPortfolio}
              onChange={e => setSelectedPortfolio(e.target.value as any)}
              className="input-field text-sm"
            >
              <option value="ALL">Tous les portefeuilles</option>
              <option value="PHRONESIS">Phronesis (Passif)</option>
              <option value="FLAGSHIP">FlagShip (Actif)</option>
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="input-field text-sm"
            >
              <option value="value">Trier par valeur</option>
              <option value="gain">Trier par gain</option>
              <option value="symbol">Trier par symbole</option>
            </select>
            <span className="text-sm text-gray-500">{filteredHoldings.length} position{filteredHoldings.length > 1 ? 's' : ''}</span>
          </div>
        </motion.div>
      )}

      {/* ── Tableau actifs admin ───────────────────────────────────────────── */}
      {user?.role === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Gestion des Actifs</h2>
              <p className="text-xs text-gray-400 mt-0.5">Positions ouvertes dans les portefeuilles</p>
            </div>
            <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-medium">
              {filteredHoldings.length} actif{filteredHoldings.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  {['Asset', 'Portefeuille', 'Quantité', 'Prix moyen', 'Prix actuel', 'Valeur', 'Gain/Perte', 'Actions'].map(h => (
                    <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide ${h === 'Actions' || h === 'Valeur' || h === 'Gain/Perte' || h === 'Quantité' || h === 'Prix moyen' || h === 'Prix actuel' ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filteredHoldings.map((holding, index) => {
                  const mv   = holding.quantity * holding.current_price;
                  const cost = holding.quantity * holding.avg_price;
                  const gain = mv - cost;
                  const pct  = cost > 0 ? (gain / cost) * 100 : 0;
                  return (
                    <motion.tr
                      key={holding.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-xs">{holding.symbol.substring(0, 2)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{holding.symbol}</p>
                            <p className="text-xs text-gray-400">{holding.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <Badge
                          label={holding.portfolio === 'PHRONESIS' ? 'Phronesis' : 'FlagShip'}
                          variant={holding.portfolio === 'PHRONESIS' ? 'primary' : 'success'}
                        />
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300">{holding.quantity}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300">{fmt(holding.avg_price)}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">{fmt(holding.current_price)}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900 dark:text-white">{fmt(mv)}</td>
                      <td className={`px-5 py-4 whitespace-nowrap text-right text-sm font-semibold ${gain >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        <div>{fmt(gain)}</div>
                        <div className="text-xs opacity-75">{pct >= 0 ? '+' : ''}{pct.toFixed(2)}%</div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button onClick={() => alert('Édition à venir')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Éditer">
                            <Edit className="w-4 h-4 text-gray-500" />
                          </button>
                          <button onClick={() => handleDelete(holding)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Supprimer">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {filteredHoldings.length === 0 && (
              <div className="text-center py-16">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Aucun actif dans ce portefeuille</p>
                <p className="text-gray-400 text-sm mt-1">Ajoutez votre premier actif pour commencer</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Section investissements membre ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        {/* Header section */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {user?.role === 'admin' ? 'Comptes membres' : 'Mes Investissements'}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Phronesis Capital · Gestion de portefeuille</p>
            </div>
            {/* Tabs portefeuille */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Sélecteur de devise */}
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-gray-400 whitespace-nowrap">Devise :</span>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value as Currency)}
                  className="text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  {(Object.entries(CURRENCY_LABELS) as [Currency, string][]).map(([code, label]) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
              </div>
              {/* Tabs */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
                {(['ALL', 'PHRONESIS', 'FLAGSHIP'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveInvTab(tab)}
                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      activeInvTab === tab
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {tab === 'ALL' ? 'Tous' : tab === 'PHRONESIS' ? 'Phronesis' : 'FlagShip'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* KPI résumé investissements */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
            {[
              { label: 'Capital investi', value: fmt(invTotalBalance), color: 'text-blue-600 dark:text-blue-400' },
              { label: 'Valeur brute', value: fmt(invTotalGrossValue), color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Nbre de parts', value: invTotalShares.toFixed(2), color: 'text-purple-600 dark:text-purple-400' },
            ].map((kpi, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-2.5 sm:p-3 text-center">
                <p className="text-[10px] sm:text-xs text-gray-400 mb-1 leading-tight">{kpi.label}</p>
                <p className={`text-xs sm:text-sm font-bold ${kpi.color} break-all`}>{kpi.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tableau investissements — desktop / Cards — mobile */}
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-700 to-blue-900 text-white">
                {['N°', 'ID Membre', 'Nom & Prénom', 'Email', 'Téléphone', "Date d'entrée", 'Capital versé', 'Nbre de parts', 'Valeur brute', 'Portfolio', 'Statut'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap text-left first:text-center">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredInvestments.map((inv, idx) => (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}
                >
                  <td className="px-4 py-4 text-center">
                    <span className="w-7 h-7 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center mx-auto">{idx + 1}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md">{inv.member_external_id || 'N/A'}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white uppercase">{user?.firstName} {user?.lastName}</p>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{inv.email}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{inv.telephone || 'N/A'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{inv.date_entree}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{fmt(inv.balance)}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{inv.shares_count.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-extrabold text-blue-700 dark:text-blue-300">{fmt(inv.gross_value)}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge label={inv.portfolio_name || inv.portfolio_type} variant={inv.portfolio_type === 'PHRONESIS' ? 'primary' : 'success'} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge label={inv.is_active ? 'Actif' : 'Inactif'} variant={inv.is_active ? 'success' : 'gray'} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vue mobile — cards */}
        <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
          {filteredInvestments.map((inv, idx) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="p-4 space-y-3"
            >
              {/* Header card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                  <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md">{inv.member_external_id || 'N/A'}</span>
                </div>
                <div className="flex gap-1.5">
                  <Badge label={inv.portfolio_name || inv.portfolio_type} variant={inv.portfolio_type === 'PHRONESIS' ? 'primary' : 'success'} />
                  <Badge label={inv.is_active ? 'Actif' : 'Inactif'} variant={inv.is_active ? 'success' : 'gray'} />
                </div>
              </div>
              {/* Nom */}
              <p className="text-sm font-semibold text-gray-900 dark:text-white uppercase">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-400">{inv.email} · {inv.date_entree}</p>
              {/* Chiffres */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-gray-400 mb-0.5">Capital</p>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{fmt(inv.balance)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-gray-400 mb-0.5">Parts</p>
                  <p className="text-xs font-bold text-purple-600 dark:text-purple-400">{inv.shares_count.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-gray-400 mb-0.5">Valeur brute</p>
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{fmt(inv.gross_value)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {isAddAssetModalOpen && (
        <AddAssetModalSimple
          onClose={() => setIsAddAssetModalOpen(false)}
          onAddAsset={handleAddAsset}
        />
      )}
      {isUploadModalOpen && (
        <ExcelUploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={() => { fetchHoldings(); fetchMemberInvestments(); setIsUploadModalOpen(false); }}
        />
      )}
    </div>
  );
};

export default PortfolioSimple;
