import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, Users,
  BarChart3, RefreshCw, ArrowUpRight, ArrowDownRight,
  Wallet, Activity
} from 'lucide-react';
import WelcomeMessage from '../components/WelcomeMessage';
import { useAppStore } from '../store/useAppStore';
import { useCurrency } from '../hooks/useCurrency';
import { Currency, CURRENCY_LABELS, formatCurrency } from '../utils/currency';

const normalizeType = (type: string): string => {
  const t = (type || '').toUpperCase().trim();
  if (t === 'PHR' || t === 'PHRONESIS') return 'PHRONESIS';
  if (t === 'FLG' || t === 'FLAGSHIP')  return 'FLAGSHIP';
  return t;
};

const PORTFOLIO_COLORS = { PHRONESIS: '#3b82f6', FLAGSHIP: '#10b981' };

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Global' | 'PHRONESIS' | 'FLAGSHIP'>('Global');
  const [currency, setCurrency]   = useState<Currency>('XOF');
  const { memberInvestments, loadingMemberInvestments } = useAppStore();
  const { rates, lastUpdated, refresh: refreshRates } = useCurrency();

  const fmt = (n: number) => formatCurrency(n, currency, rates);

  const stats = useMemo(() => {
    const phronesis = memberInvestments.filter(inv => normalizeType(inv.portfolio_type) === 'PHRONESIS');
    const flagship  = memberInvestments.filter(inv => normalizeType(inv.portfolio_type) === 'FLAGSHIP');
    const sum = (list: typeof memberInvestments, key: keyof typeof memberInvestments[0]) =>
      list.reduce((s, inv) => s + (inv[key] as number), 0);

    const phronesisNav     = sum(phronesis, 'gross_value');
    const flagshipNav      = sum(flagship,  'gross_value');
    const totalNav         = phronesisNav + flagshipNav;
    const phronesisBalance = sum(phronesis, 'balance');
    const flagshipBalance  = sum(flagship,  'balance');
    const totalBalance     = phronesisBalance + flagshipBalance;
    const totalShares      = sum(memberInvestments, 'shares_count');
    const totalGain        = totalNav - totalBalance;
    const totalGainPct     = totalBalance > 0 ? (totalGain / totalBalance) * 100 : 0;

    const portfolioSplit = [
      { name: 'Phronesis', value: totalNav > 0 ? parseFloat(((phronesisNav / totalNav) * 100).toFixed(1)) : 0, color: PORTFOLIO_COLORS.PHRONESIS },
      { name: 'FlagShip',  value: totalNav > 0 ? parseFloat(((flagshipNav  / totalNav) * 100).toFixed(1)) : 0, color: PORTFOLIO_COLORS.FLAGSHIP  },
    ];

    // Données graphique area : un point par compte membre
    const areaData = memberInvestments
      .sort((a, b) => a.id - b.id)
      .map((inv, i) => ({
        name: inv.member_external_id || `M${i + 1}`,
        valeur: inv.gross_value,
        capital: inv.balance,
        portfolio: normalizeType(inv.portfolio_type),
      }));

    return {
      totalNav, phronesisNav, flagshipNav,
      totalBalance, phronesisBalance, flagshipBalance,
      totalShares, totalGain, totalGainPct,
      portfolioSplit, areaData,
      totalMembers: memberInvestments.length,
    };
  }, [memberInvestments]);

  const filteredInvestments = useMemo(() => {
    if (activeTab === 'Global') return memberInvestments;
    return memberInvestments.filter(inv => normalizeType(inv.portfolio_type) === activeTab);
  }, [memberInvestments, activeTab]);

  const currentNav     = activeTab === 'Global' ? stats.totalNav     : activeTab === 'PHRONESIS' ? stats.phronesisNav     : stats.flagshipNav;
  const currentBalance = activeTab === 'Global' ? stats.totalBalance : activeTab === 'PHRONESIS' ? stats.phronesisBalance : stats.flagshipBalance;
  const currentGain    = currentNav - currentBalance;
  const currentGainPct = currentBalance > 0 ? (currentGain / currentBalance) * 100 : 0;

  const areaData = useMemo(() =>
    activeTab === 'Global'
      ? stats.areaData
      : stats.areaData.filter(d => d.portfolio === activeTab),
  [stats.areaData, activeTab]);

  const kpis = [
    {
      label: 'Valeur totale (NAV)',
      value: fmt(currentNav),
      sub: `${filteredInvestments.length} compte${filteredInvestments.length > 1 ? 's' : ''}`,
      icon: Wallet,
      gradient: 'from-blue-600 to-blue-800',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-300',
    },
    {
      label: 'Capital investi',
      value: fmt(currentBalance),
      sub: activeTab === 'Global' ? `PHR: ${fmt(stats.phronesisBalance)} · FLG: ${fmt(stats.flagshipBalance)}` : '',
      icon: DollarSign,
      gradient: 'from-emerald-600 to-emerald-800',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-300',
    },
    {
      label: 'Plus-value',
      value: fmt(currentGain),
      sub: `${currentGainPct >= 0 ? '+' : ''}${currentGainPct.toFixed(2)}% vs capital`,
      icon: currentGain >= 0 ? TrendingUp : TrendingDown,
      gradient: currentGain >= 0 ? 'from-violet-600 to-violet-800' : 'from-red-600 to-red-800',
      iconBg: currentGain >= 0 ? 'bg-violet-500/20' : 'bg-red-500/20',
      iconColor: currentGain >= 0 ? 'text-violet-300' : 'text-red-300',
      positive: currentGain >= 0,
    },
    {
      label: 'Parts totales',
      value: stats.totalShares.toFixed(2),
      sub: `${stats.totalMembers} membre${stats.totalMembers > 1 ? 's' : ''}`,
      icon: Users,
      gradient: 'from-amber-600 to-amber-800',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-300',
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <WelcomeMessage />

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1 w-fit">
          {(['Global', 'PHRONESIS', 'FLAGSHIP'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}>
              {tab === 'Global' ? 'Global' : tab === 'PHRONESIS' ? 'Phronesis' : 'FlagShip'}
            </button>
          ))}
        </div>

        {/* Devise + refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <select value={currency} onChange={e => setCurrency(e.target.value as Currency)}
              className="text-sm font-medium bg-transparent text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer">
              {(Object.entries(CURRENCY_LABELS) as [Currency, string][]).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>
          <button onClick={refreshRates} title="Actualiser les taux"
            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          {lastUpdated && (
            <span className="text-xs text-gray-400 hidden md:block">
              Taux mis à jour {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {loadingMemberInvestments ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Chargement des données...</p>
          </div>
        </div>
      ) : (
        <>
          {/* ── KPI Cards ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {kpis.map((kpi, i) => (
              <motion.div key={i} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${kpi.gradient} p-6 text-white shadow-lg`}>
                {/* Cercle décoratif */}
                <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5" />
                <div className="absolute -bottom-8 -right-2 w-20 h-20 rounded-full bg-white/5" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${kpi.iconBg}`}>
                      <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
                    </div>
                    {'positive' in kpi && (
                      <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
                        kpi.positive ? 'bg-white/20 text-white' : 'bg-white/20 text-white'
                      }`}>
                        {kpi.positive
                          ? <ArrowUpRight className="w-3 h-3 mr-1" />
                          : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {currentGainPct >= 0 ? '+' : ''}{currentGainPct.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold text-white leading-tight">{kpi.value}</p>
                  {kpi.sub && <p className="text-white/60 text-xs mt-1.5 truncate">{kpi.sub}</p>}
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Phronesis vs FlagShip summary ──────────────────────────────── */}
          {activeTab === 'Global' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { name: 'Phronesis Portfolio', nav: stats.phronesisNav, capital: stats.phronesisBalance, color: 'blue', border: 'border-blue-500' },
                { name: 'FlagShip Portfolio',  nav: stats.flagshipNav,  capital: stats.flagshipBalance,  color: 'emerald', border: 'border-emerald-500' },
              ].map((p, i) => {
                const gain    = p.nav - p.capital;
                const gainPct = p.capital > 0 ? (gain / p.capital) * 100 : 0;
                return (
                  <motion.div key={i} custom={i + 4} variants={cardVariants} initial="hidden" animate="visible"
                    className={`bg-white dark:bg-gray-900 rounded-2xl border-l-4 ${p.border} border border-gray-100 dark:border-gray-800 p-6 shadow-sm`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{p.name}</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        gainPct >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                     : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {gainPct >= 0 ? '+' : ''}{gainPct.toFixed(2)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">NAV</p>
                        <p className={`font-bold text-sm ${p.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{fmt(p.nav)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Capital</p>
                        <p className="font-bold text-sm text-gray-900 dark:text-white">{fmt(p.capital)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Plus-value</p>
                        <p className={`font-bold text-sm ${gain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{fmt(gain)}</p>
                      </div>
                    </div>
                    {/* Barre de progression NAV vs capital */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progression</span>
                        <span>{p.capital > 0 ? ((p.nav / p.capital) * 100).toFixed(1) : 0}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all duration-700 ${p.color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(p.capital > 0 ? (p.nav / p.capital) * 100 : 0, 100)}%` }} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ── Charts ─────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Area chart — occupe 2/3 */}
            <motion.div custom={6} variants={cardVariants} initial="hidden" animate="visible"
              className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Valeur brute vs Capital investi</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Par compte membre · {activeTab}</p>
                </div>
                <BarChart3 className="w-5 h-5 text-gray-300" />
              </div>
              {areaData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={areaData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="gradValeur" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradCapital" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:opacity-10" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f1f5f9', fontSize: 12 }}
                      formatter={(v: number, name: string) => [fmt(v), name === 'valeur' ? 'Valeur brute' : 'Capital investi']}
                    />
                    <Area type="monotone" dataKey="valeur"  stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradValeur)"  name="valeur" />
                    <Area type="monotone" dataKey="capital" stroke="#10b981" strokeWidth={2.5} fill="url(#gradCapital)" name="capital" strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-300">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Aucune donnée pour ce portefeuille</p>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-blue-500 rounded" /><span className="text-gray-500">Valeur brute</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-emerald-500 rounded border-dashed" /><span className="text-gray-500">Capital investi</span></div>
              </div>
            </motion.div>

            {/* Pie chart — 1/3 */}
            <motion.div custom={7} variants={cardVariants} initial="hidden" animate="visible"
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white">Répartition NAV</h3>
                <p className="text-xs text-gray-400 mt-0.5">Par portefeuille</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={stats.portfolioSplit} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {stats.portfolioSplit.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f1f5f9', fontSize: 12 }}
                    formatter={(v: number) => [`${v}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 mt-4">
                {stats.portfolioSplit.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{item.value}%</span>
                      <p className="text-xs text-gray-400">{fmt(i === 0 ? stats.phronesisNav : stats.flagshipNav)}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Total */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total NAV</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{fmt(stats.totalNav)}</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
