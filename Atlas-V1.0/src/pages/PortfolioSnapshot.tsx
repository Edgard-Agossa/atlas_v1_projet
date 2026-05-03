import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TableProperties, Upload, RefreshCw, TrendingUp, TrendingDown,
  DollarSign, BarChart3, ChevronDown, ChevronUp, X, FileText,
  Calendar, User, Eye, Trash2, AlertCircle, CheckCircle,
  ArrowUpRight, ArrowDownRight, Minus, Search, Filter,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import API_BASE_URL from '../config/api';
import { apiFetch } from '../utils/apiFetch';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SnapshotSummary {
  id: number;
  portfolio_name: string;
  semaine: string;
  vnl: string | null;
  rows_count: number;
  created_at: string;
  uploaded_by: string | null;
}

interface SnapshotRow {
  id: number;
  actif: string;
  poids: string;
  quantite: string;
  cours_achat: string;
  cours_cloture: string;
  dividende: string;
  rendement_brut: string;
  investissement: string;
  valorisation: string;
  rendement_annuel: string;
  variation_semaine: string;
}

interface SnapshotDetail {
  id: number;
  portfolio_name: string;
  semaine: string;
  vnl: string | null;
  created_at: string;
  uploaded_by: string | null;
  summary: {
    total_investissement: string;
    total_valorisation: string;
    total_dividende: string;
    performance_globale: string;
  };
  rows: SnapshotRow[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (val: string | number, decimals = 0) => {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n)) return '—';
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
};

const fmtPct = (val: string | number) => {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n)) return '—';
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

const VariationBadge: React.FC<{ value: string }> = ({ value }) => {
  const n = parseFloat(value);
  if (isNaN(n) || n === 0) return <span className="text-gray-400 text-xs font-medium">—</span>;
  const positive = n > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
      positive
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }`}>
      {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {fmtPct(n)}
    </span>
  );
};

const RendementBadge: React.FC<{ value: string }> = ({ value }) => {
  const n = parseFloat(value) * 100;
  if (isNaN(n) || n === 0) return <span className="text-gray-400 text-xs">—</span>;
  const positive = n > 0;
  return (
    <span className={`text-xs font-bold ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
      {positive ? '+' : ''}{n.toFixed(1)}%
    </span>
  );
};

// ─── Upload Modal ─────────────────────────────────────────────────────────────

const UploadModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [portfolioName, setPortfolioName] = useState('Phronesis');
  const [semaine, setSemaine] = useState('');
  const [vnl, setVnl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith('.csv')) setFile(dropped);
    else setError('Seuls les fichiers .csv sont acceptés.');
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('portfolio_name', portfolioName);
    formData.append('semaine', semaine);
    if (vnl) formData.append('vnl', vnl);

    try {
      const res = await apiFetch(`${API_BASE_URL}/investment/snapshots/upload/`, {
        method: 'POST',
        body: formData,
        headers: {},
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Erreur lors de l\'import.');
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Importer un récapitulatif</h3>
              <p className="text-xs text-gray-400 mt-0.5">Fichier CSV du portfolio</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Portfolio + Semaine */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Portfolio</label>
              <select
                value={portfolioName}
                onChange={e => setPortfolioName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                <option value="Phronesis">Phronesis</option>
                <option value="FlagShip">FlagShip</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Semaine / Période</label>
              <input
                type="text"
                placeholder="ex: S12 — 21/03/2026"
                value={semaine}
                onChange={e => setSemaine(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* VNL */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">VNL (Valeur Nette Liquidative)</label>
            <input
              type="number"
              placeholder="ex: 2555"
              value={vnl}
              onChange={e => setVnl(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : file
                ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Glissez votre fichier CSV ici
                </p>
                <p className="text-xs text-gray-400">ou cliquez pour sélectionner</p>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            Annuler
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl transition-colors flex items-center gap-2"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Importation...</>
            ) : (
              <><Upload className="w-4 h-4" />Importer</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Snapshot Detail Panel ────────────────────────────────────────────────────

const SnapshotDetailPanel: React.FC<{
  snapshotId: number;
  onClose: () => void;
  onDelete: (id: number) => void;
  isAdmin: boolean;
}> = ({ snapshotId, onClose, onDelete, isAdmin }) => {
  const [detail, setDetail] = useState<SnapshotDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof SnapshotRow>('actif');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    apiFetch(`${API_BASE_URL}/investment/snapshots/${snapshotId}/`)
      .then(r => r.json())
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [snapshotId]);

  const toggleSort = (key: keyof SnapshotRow) => {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortIcon: React.FC<{ col: keyof SnapshotRow }> = ({ col }) => {
    if (sortKey !== col) return <Minus className="w-3 h-3 text-gray-300" />;
    return sortAsc ? <ChevronUp className="w-3 h-3 text-blue-500" /> : <ChevronDown className="w-3 h-3 text-blue-500" />;
  };

  const filteredRows = detail?.rows
    .filter(r => r.actif.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const va = a[sortKey] as string;
      const vb = b[sortKey] as string;
      const na = parseFloat(va);
      const nb = parseFloat(vb);
      const cmp = isNaN(na) ? va.localeCompare(vb) : na - nb;
      return sortAsc ? cmp : -cmp;
    }) ?? [];

  const perfGlobal = detail ? parseFloat(detail.summary.performance_globale) : 0;

  const kpis = detail ? [
    {
      label: 'Total Investi',
      value: `${fmt(detail.summary.total_investissement)} CFA`,
      icon: DollarSign,
      color: 'blue',
    },
    {
      label: 'Valorisation',
      value: `${fmt(detail.summary.total_valorisation)} CFA`,
      icon: BarChart3,
      color: 'violet',
    },
    {
      label: 'Dividendes',
      value: `${fmt(detail.summary.total_dividende)} CFA`,
      icon: TrendingUp,
      color: 'amber',
    },
    {
      label: 'Performance',
      value: fmtPct(perfGlobal),
      icon: perfGlobal >= 0 ? TrendingUp : TrendingDown,
      color: perfGlobal >= 0 ? 'emerald' : 'red',
    },
  ] : [];

  const colorMap: Record<string, string> = {
    blue: 'from-blue-600 to-blue-800',
    violet: 'from-violet-600 to-violet-800',
    amber: 'from-amber-500 to-amber-700',
    emerald: 'from-emerald-600 to-emerald-800',
    red: 'from-red-600 to-red-800',
  };

  const thClass = "px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 select-none whitespace-nowrap";

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="fixed inset-0 z-50 flex"
    >
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-5xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-600 to-blue-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <TableProperties className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">
                {detail?.portfolio_name ?? '...'} — {detail?.semaine ?? ''}
              </h2>
              <div className="flex items-center gap-3 mt-0.5">
                {detail?.vnl && (
                  <span className="text-blue-200 text-xs font-medium">VNL : {fmt(detail.vnl)} CFA</span>
                )}
                {detail?.created_at && (
                  <span className="text-blue-200 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />{fmtDate(detail.created_at)}
                  </span>
                )}
                {detail?.uploaded_by && (
                  <span className="text-blue-200 text-xs flex items-center gap-1">
                    <User className="w-3 h-3" />{detail.uploaded_by}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && detail && (
              <button
                onClick={() => { onDelete(detail.id); onClose(); }}
                className="p-2 bg-white/10 hover:bg-red-500/30 rounded-xl transition-colors"
                title="Supprimer ce snapshot"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            )}
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Chargement du snapshot...</p>
            </div>
          </div>
        ) : detail ? (
          <div className="flex-1 overflow-y-auto">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6">
              {kpis.map((kpi, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorMap[kpi.color]} p-5 text-white shadow-lg`}
                >
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/5" />
                  <div className="relative z-10">
                    <div className="p-2 bg-white/20 rounded-xl w-fit mb-3">
                      <kpi.icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-1">{kpi.label}</p>
                    <p className="text-xl font-bold text-white">{kpi.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Barre de recherche */}
            <div className="px-6 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un actif..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Table */}
            <div className="px-6 pb-6">
              <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/80">
                      <tr>
                        {[
                          { key: 'actif', label: 'Actif' },
                          { key: 'poids', label: 'Poids' },
                          { key: 'quantite', label: 'Qté' },
                          { key: 'cours_achat', label: "Cours d'achat" },
                          { key: 'cours_cloture', label: 'Cours clôture' },
                          { key: 'dividende', label: 'Dividende' },
                          { key: 'investissement', label: 'Investissement' },
                          { key: 'valorisation', label: 'Valorisation' },
                          { key: 'rendement_annuel', label: 'Rdt annuel' },
                          { key: 'variation_semaine', label: 'Var. semaine' },
                        ].map(col => (
                          <th key={col.key} className={thClass} onClick={() => toggleSort(col.key as keyof SnapshotRow)}>
                            <div className="flex items-center gap-1">
                              {col.label}
                              <SortIcon col={col.key as keyof SnapshotRow} />
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredRows.map((row, i) => (
                        <motion.tr
                          key={row.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="bg-white dark:bg-gray-900 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                        >
                          <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                            {row.actif}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-center">
                            <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                              {(parseFloat(row.poids) * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-right">{fmt(row.quantite, 2)}</td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-right">{fmt(row.cours_achat)}</td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-right">{fmt(row.cours_cloture)}</td>
                          <td className="px-4 py-3 text-right">
                            {parseFloat(row.dividende) > 0
                              ? <span className="text-amber-600 dark:text-amber-400 font-medium">{fmt(row.dividende)}</span>
                              : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-right font-medium">{fmt(row.investissement)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">{fmt(row.valorisation)}</td>
                          <td className="px-4 py-3 text-center"><RendementBadge value={row.rendement_annuel} /></td>
                          <td className="px-4 py-3 text-center"><VariationBadge value={row.variation_semaine} /></td>
                        </motion.tr>
                      ))}
                    </tbody>
                    {/* Footer totaux */}
                    <tfoot className="bg-gray-50 dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700">
                      <tr>
                        <td colSpan={6} className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Totaux ({filteredRows.length} actifs)
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                          {fmt(detail.summary.total_investissement)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400">
                          {fmt(detail.summary.total_valorisation)}
                        </td>
                        <td colSpan={2} className="px-4 py-3 text-center">
                          <VariationBadge value={detail.summary.performance_globale} />
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const PortfolioSnapshot: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [snapshots, setSnapshots] = useState<SnapshotSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filterPortfolio, setFilterPortfolio] = useState<string>('all');
  const [searchSemaine, setSearchSemaine] = useState('');

  const fetchSnapshots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/investment/snapshots/`);
      const data = await res.json();
      setSnapshots(data.snapshots ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSnapshots(); }, [fetchSnapshots]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce snapshot définitivement ?')) return;
    await apiFetch(`${API_BASE_URL}/investment/snapshots/${id}/`, { method: 'DELETE' });
    fetchSnapshots();
  };

  const filtered = snapshots.filter(s => {
    const matchPortfolio = filterPortfolio === 'all' || s.portfolio_name === filterPortfolio;
    const matchSearch = s.semaine.toLowerCase().includes(searchSemaine.toLowerCase());
    return matchPortfolio && matchSearch;
  });

  // Dernier snapshot pour les KPIs de la page principale
  const latest = snapshots[0];

  return (
    <div className="space-y-6 pb-8">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg flex-shrink-0">
            <TableProperties className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Portfolio Global</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block mt-0.5">
              Historique des snapshots hebdomadaires du portfolio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={fetchSnapshots}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Importer CSV</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Dernier snapshot — bannière résumé ───────────────────────────── */}
      {latest && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 shadow-xl cursor-pointer group"
          onClick={() => setSelectedId(latest.id)}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1),_transparent_60%)]" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                  Dernier snapshot
                </span>
                <span className="text-blue-200 text-xs">{fmtDate(latest.created_at)}</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {latest.portfolio_name} — {latest.semaine}
              </h2>
              <div className="flex items-center gap-4 mt-2">
                {latest.vnl && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-200 text-xs">VNL</span>
                    <span className="text-white font-bold">{fmt(latest.vnl)} CFA</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-200 text-xs">Actifs</span>
                  <span className="text-white font-bold">{latest.rows_count}</span>
                </div>
                {latest.uploaded_by && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3 text-blue-300" />
                    <span className="text-blue-200 text-xs">{latest.uploaded_by}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
              <Eye className="w-5 h-5" />
              <span className="text-sm font-medium">Voir le détail</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Filtres ───────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par semaine..."
            value={searchSemaine}
            onChange={e => setSearchSemaine(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
        <div className="relative flex-shrink-0">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filterPortfolio}
            onChange={e => setFilterPortfolio(e.target.value)}
            className="pl-9 pr-7 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white appearance-none cursor-pointer"
          >
            <option value="all">Tous</option>
            <option value="Phronesis">Phronesis</option>
            <option value="FlagShip">FlagShip</option>
          </select>
        </div>
      </motion.div>

      {/* ── Liste des snapshots ───────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Chargement des récapitulatifs...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700"
        >
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-4">
            <TableProperties className="w-10 h-10 text-blue-400" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-semibold text-base mb-1">Aucun récapitulatif disponible</p>
          <p className="text-gray-400 text-sm mb-5 text-center px-6">
            Importez votre premier fichier CSV pour visualiser les données du portfolio
          </p>
          {isAdmin && (
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" />
              Importer le premier CSV
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((snap, i) => (
            <motion.div
              key={snap.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer"
              onClick={() => setSelectedId(snap.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      snap.portfolio_name === 'Phronesis'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {snap.portfolio_name}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">{snap.semaine || '—'}</h3>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedId(snap.id); }}
                    className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 text-blue-500" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(snap.id); }}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">VNL</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {snap.vnl ? `${fmt(snap.vnl)} CFA` : '—'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Actifs</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{snap.rows_count}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {fmtDate(snap.created_at)}
                </div>
                {snap.uploaded_by && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {snap.uploaded_by}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onSuccess={fetchSnapshots}
          />
        )}
        {selectedId !== null && (
          <SnapshotDetailPanel
            snapshotId={selectedId}
            onClose={() => setSelectedId(null)}
            onDelete={handleDelete}
            isAdmin={isAdmin}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioSnapshot;
