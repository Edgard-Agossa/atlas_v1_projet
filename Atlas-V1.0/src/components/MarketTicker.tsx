import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Plus, X, RefreshCw,
  Edit, Trash2, Settings, RotateCcw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import API_BASE_URL from '../config/api';
import { apiFetch } from '../utils/apiFetch';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TickerItem {
  id: number;
  symbol: string;
  name: string;
  current_price: number;
  variation: number;
  currency: string;
  is_active: boolean;
  order: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtPrice = (n: number, currency: string) => {
  // Forex et taux de change — 4 décimales
  if (currency.includes('/') || ['EUR/USD','EUR/XOF','GBP/USD'].includes(currency)) {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(n);
  }
  // Cryptos < 1$ — plus de décimales
  if (n < 1) return n.toFixed(6);
  if (n < 100) return n.toFixed(2);
  // Grands nombres (or, BTC...)
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(n);
};

const fmtPct = (n: number) =>
  `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

// ─── Ticker Item ──────────────────────────────────────────────────────────────

const TickerChip: React.FC<{ item: TickerItem }> = ({ item }) => {
  const up = item.variation >= 0;
  // Unité à afficher selon la devise
  const unit = item.currency === 'XOF' || item.currency === 'EUR/XOF' ? ' CFA'
    : item.currency === 'USD' ? ' $'
    : item.currency === 'EUR' ? ' €'
    : item.currency ? ` ${item.currency}`
    : '';
  return (
    <span className="inline-flex items-center gap-2 px-3 whitespace-nowrap select-none">
      <span className="text-xs font-bold text-white/90">{item.symbol}</span>
      <span className="text-xs text-white/70">{fmtPrice(item.current_price, item.currency)}{unit}</span>
      <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-emerald-300' : 'text-red-300'}`}>
        {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {fmtPct(item.variation)}
      </span>
      <span className="text-white/20 text-xs">|</span>
    </span>
  );
};

// ─── Modal gestion ────────────────────────────────────────────────────────────

const TickerModal: React.FC<{
  assets: TickerItem[];
  onClose: () => void;
  onRefresh: () => void;
}> = ({ assets, onClose, onRefresh }) => {
  const [form, setForm] = useState({ symbol: '', name: '', current_price: '', variation_pct: '' });
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  const addAsset = async () => {
    if (!form.symbol) { setError('Le symbole est requis'); return; }
    setSaving(true); setError('');
    try {
      const res = await apiFetch(`${API_BASE_URL}/investment/ticker/`, {
        method: 'POST',
        body: JSON.stringify({
          symbol: form.symbol.toUpperCase(),
          name: form.name || form.symbol,
          current_price: parseFloat(form.current_price) || 0,
          variation_pct: parseFloat(form.variation_pct) || 0,
        }),
      });
      if (res.ok) {
        setForm({ symbol: '', name: '', current_price: '', variation_pct: '' });
        onRefresh();
      } else {
        const d = await res.json();
        setError(d.error || 'Erreur');
      }
    } catch { setError('Erreur réseau'); }
    finally { setSaving(false); }
  };

  const deleteAsset = async (id: number) => {
    await apiFetch(`${API_BASE_URL}/investment/ticker/${id}/`, { method: 'DELETE' });
    onRefresh();
  };

  const syncFromSnapshot = async () => {
    setSyncing(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/investment/ticker/sync/`, {
        method: 'POST',
        body: JSON.stringify({ action: 'snapshot' }),
      });
      const d = await res.json();
      if (d.success) onRefresh();
      else setError(d.error || 'Erreur sync');
    } catch { setError('Erreur réseau'); }
    finally { setSyncing(false); }
  };

  const syncFromMarket = async () => {
    setSyncing(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/investment/ticker/sync/`, {
        method: 'POST',
        body: JSON.stringify({ action: 'market' }),
      });
      const d = await res.json();
      if (d.success) onRefresh();
      else setError(d.error || 'Erreur sync marché');
    } catch { setError('Erreur réseau'); }
    finally { setSyncing(false); }
  };

  // Actifs populaires à ajouter en un clic
  const QUICK_ADD = [
    { symbol: 'BTC',    name: 'Bitcoin' },
    { symbol: 'ETH',    name: 'Ethereum' },
    { symbol: 'BNB',    name: 'BNB' },
    { symbol: 'SOL',    name: 'Solana' },
    { symbol: 'XRP',    name: 'Ripple' },
    { symbol: 'USDT',   name: 'Tether' },
    { symbol: 'XAUUSD', name: 'Or (Gold)' },
    { symbol: 'XAGUSD', name: 'Argent (Silver)' },
    { symbol: 'EUR/USD', name: 'Euro/Dollar' },
    { symbol: 'EUR/XOF', name: 'Euro/CFA' },
  ];

  const quickAdd = async (symbol: string, name: string) => {
    setSaving(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/investment/ticker/`, {
        method: 'POST',
        body: JSON.stringify({ symbol, name }),
      });
      if (res.ok) onRefresh();
    } catch {}
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-900 to-blue-950">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Gérer le ticker</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={syncFromMarket} disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors">
              {syncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />}
              Marché live
            </button>
            <button onClick={syncFromSnapshot} disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors">
              {syncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
              Snapshot
            </button>
            <button onClick={onClose} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Quick add */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Ajout rapide</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ADD.map(q => {
                const already = assets.some(a => a.symbol === q.symbol);
                return (
                  <button key={q.symbol} onClick={() => !already && quickAdd(q.symbol, q.name)}
                    disabled={already || saving}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                      already
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-default'
                        : 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}>
                    {already ? '✓ ' : '+ '}{q.symbol}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formulaire ajout manuel */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ajouter un actif</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1">Symbole *</label>
                <input type="text" value={form.symbol} onChange={e => setForm(f => ({...f, symbol: e.target.value.toUpperCase()}))}
                  placeholder="BICC" maxLength={20}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1">Nom</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  placeholder="Bicici CI"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1">Cours (CFA)</label>
                <input type="number" value={form.current_price} onChange={e => setForm(f => ({...f, current_price: e.target.value}))}
                  placeholder="24000"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1">Variation % (ex: 0.62)</label>
                <input type="number" step="0.01" value={form.variation_pct} onChange={e => setForm(f => ({...f, variation_pct: e.target.value}))}
                  placeholder="0.62"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
              </div>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button onClick={addAsset} disabled={saving || !form.symbol}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-xl transition-colors">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Ajouter
            </button>
          </div>

          {/* Liste actifs */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Actifs dans le ticker ({assets.length})
            </p>
            {assets.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                Aucun actif. Ajoutez-en ou synchronisez depuis un snapshot.
              </p>
            ) : (
              assets.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${a.variation >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{a.symbol}</p>
                      <p className="text-xs text-gray-400">{a.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{fmtPrice(a.current_price, a.currency)}</p>
                      <p className={`text-xs font-bold ${a.variation >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {fmtPct(a.variation)}
                      </p>
                    </div>
                    <button onClick={() => deleteAsset(a.id)}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────

const MarketTicker: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [assets, setAssets] = useState<TickerItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  const fetchAssets = useCallback(async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/investment/ticker/`);
      const d = await res.json();
      setAssets(d.assets ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchAssets();
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchAssets, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAssets]);

  if (assets.length === 0 && !isAdmin) return null;

  // Dupliquer les items pour le défilement infini
  const displayItems = [...assets, ...assets, ...assets];

  return (
    <>
      <div className="w-full bg-gradient-to-r from-gray-900 via-blue-950 to-gray-900 border-b border-gray-800 overflow-hidden relative h-9 flex items-center">

        {/* Défilement */}
        {assets.length > 0 ? (
          <div
            ref={tickerRef}
            className="flex items-center animate-ticker whitespace-nowrap"
            style={{ animationDuration: `${Math.max(20, assets.length * 4)}s` }}
          >
            {displayItems.map((item, i) => (
              <TickerChip key={`${item.id}-${i}`} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-white/40 px-4">
            Aucun actif dans le ticker — synchronisez depuis un snapshot
          </p>
        )}

        {/* Bouton admin */}
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="absolute right-0 top-0 h-full px-3 bg-gradient-to-l from-gray-900 via-gray-900/80 to-transparent flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
            title="Gérer le ticker"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Animation CSS */}
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-ticker {
          animation: ticker linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>

      <AnimatePresence>
        {showModal && (
          <TickerModal
            assets={assets}
            onClose={() => setShowModal(false)}
            onRefresh={() => { fetchAssets(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default MarketTicker;
