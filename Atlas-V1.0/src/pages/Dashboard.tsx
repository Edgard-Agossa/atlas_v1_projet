import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import WelcomeMessage from '../components/WelcomeMessage';
import { useAppStore } from '../store/useAppStore';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Global' | 'PHRONESIS' | 'FLAGSHIP'>('Global');
  const { memberInvestments, loadingMemberInvestments } = useAppStore();

  // ── Calculs depuis les Compte_member ──────────────────────────────────────

  const stats = useMemo(() => {
    const phronesis = memberInvestments.filter(inv => inv.portfolio_type === 'PHRONESIS');
    const flagship  = memberInvestments.filter(inv => inv.portfolio_type === 'FLAGSHIP');

    const sum = (list: typeof memberInvestments, key: keyof typeof memberInvestments[0]) =>
      list.reduce((s, inv) => s + (inv[key] as number), 0);

    const phronesisNav   = sum(phronesis, 'gross_value');
    const flagshipNav    = sum(flagship,  'gross_value');
    const totalNav       = phronesisNav + flagshipNav;

    const phronesisBalance = sum(phronesis, 'balance');
    const flagshipBalance  = sum(flagship,  'balance');
    const totalBalance     = phronesisBalance + flagshipBalance;

    // Portfolio split
    const portfolioSplit = [
      { name: 'Phronesis', value: totalNav > 0 ? Math.round((phronesisNav / totalNav) * 100) : 0, color: '#3b82f6' },
      { name: 'FlagShip',  value: totalNav > 0 ? Math.round((flagshipNav  / totalNav) * 100) : 0, color: '#10b981' },
    ];

    // Répartition par portfolio pour le graphique
    const chartData = [
      { name: 'Phronesis', valeur: phronesisNav, capital: phronesisBalance },
      { name: 'FlagShip',  valeur: flagshipNav,  capital: flagshipBalance  },
    ];

    return {
      totalNav, phronesisNav, flagshipNav,
      totalBalance, phronesisBalance, flagshipBalance,
      portfolioSplit, chartData,
    };
  }, [memberInvestments]);

  // Données filtrées selon l'onglet
  const filteredInvestments = useMemo(() => {
    if (activeTab === 'Global') return memberInvestments;
    return memberInvestments.filter(inv => inv.portfolio_type === activeTab);
  }, [memberInvestments, activeTab]);

  const currentNav =
    activeTab === 'Global'    ? stats.totalNav :
    activeTab === 'PHRONESIS' ? stats.phronesisNav : stats.flagshipNav;

  const currentBalance =
    activeTab === 'Global'    ? stats.totalBalance :
    activeTab === 'PHRONESIS' ? stats.phronesisBalance : stats.flagshipBalance;

  // Graphique : valeur brute vs capital investi par membre
  const performanceData = filteredInvestments.slice(0, 12).map(inv => ({
    name: inv.member_external_id || `#${inv.id}`,
    valeur: inv.gross_value,
    capital: inv.balance,
  }));

  return (
    <div className="p-6 space-y-6">
      <WelcomeMessage />

      {/* Tabs */}
      <div className="flex space-x-2">
        {(['Global', 'PHRONESIS', 'FLAGSHIP'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {tab === 'Global' ? 'Global' : tab === 'PHRONESIS' ? 'Phronesis Portfolio' : 'FlagShip Portfolio'}
          </button>
        ))}
      </div>

      {loadingMemberInvestments ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Club Value (NAV)</h3>
              <p className="text-blue-600 dark:text-blue-400 text-2xl font-bold">{fmt(stats.totalNav)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Phronesis Portfolio NAV</h3>
              <p className="text-blue-600 dark:text-blue-400 text-2xl font-bold">{fmt(stats.phronesisNav)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">FlagShip Portfolio NAV</h3>
              <p className={`text-2xl font-bold ${stats.flagshipNav >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                {fmt(stats.flagshipNav)}
              </p>
            </div>
          </div>

          {/* Stats Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                {activeTab === 'Global' ? 'Total NAV' : `${activeTab} NAV`}
              </h3>
              <p className="text-blue-600 dark:text-blue-400 text-2xl font-bold">{fmt(currentNav)}</p>
              <p className="text-gray-500 text-xs mt-1">{filteredInvestments.length} compte(s)</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Capital investi total</h3>
              <p className="text-blue-600 dark:text-blue-400 text-2xl font-bold">{fmt(currentBalance)}</p>
              {activeTab === 'Global' && (
                <div className="mt-1 space-y-0.5">
                  <p className="text-gray-500 text-xs">Phronesis: {fmt(stats.phronesisBalance)}</p>
                  <p className="text-gray-500 text-xs">FlagShip: {fmt(stats.flagshipBalance)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Valeur brute vs Capital */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
              <h3 className="text-gray-900 dark:text-gray-300 text-lg font-semibold mb-4">
                Valeur brute vs Capital investi — {activeTab}
              </h3>
              {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#374151' }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#374151' }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '6px', color: '#f3f4f6' }}
                      formatter={(v: number) => fmt(v)}
                    />
                    <Line type="monotone" dataKey="valeur"  stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} name="Valeur brute" />
                    <Line type="monotone" dataKey="capital" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#10b981', r: 3 }} name="Capital investi" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">Aucune donnée pour ce portefeuille</div>
              )}
              <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
                <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded-full mr-2" /><span className="text-blue-400">Valeur brute</span></div>
                <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-2" /><span className="text-green-400">Capital investi</span></div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Portfolio Split */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-gray-900 dark:text-gray-300 text-lg font-semibold mb-4">Portfolio Split</h3>
                <div className="flex items-center justify-between">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={stats.portfolioSplit} cx="50%" cy="50%" innerRadius={35} outerRadius={70} dataKey="value">
                        {stats.portfolioSplit.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '6px', color: '#f3f4f6' }} formatter={(v) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {stats.portfolioSplit.map((item, i) => (
                      <div key={i} className="flex items-center space-x-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Répartition NAV par portfolio */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-gray-900 dark:text-gray-300 text-lg font-semibold mb-4">Répartition NAV</h3>
                <div className="space-y-3">
                  {stats.chartData.map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{fmt(item.valeur)}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: stats.totalNav > 0 ? `${(item.valeur / stats.totalNav) * 100}%` : '0%',
                            backgroundColor: COLORS[i],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
