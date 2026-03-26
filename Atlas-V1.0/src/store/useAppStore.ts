import { create } from 'zustand';
import { AccountService, Transaction, Prtfolios } from '../contexts/DataUrl';
import API_BASE_URL from '../config/api';
import { apiFetch } from '../utils/apiFetch';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MemberItem {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: string | null;
  is_active: boolean;
  join_date: string;
  last_login: string | null;
}

export interface HoldingItem {
  id: number;
  asset: string;
  symbol: string;
  name: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  portfolio: string;
  sector: string;
  asset_type: string;
  last_updated: string;
}

export interface MemberInvestment {
  id: number;
  member_external_id: string;
  email: string;
  telephone: string;
  date_entree: string;
  balance: number;
  shares_count: number;
  gross_value: number;
  portfolio_type: string;
  portfolio_name: string;
  is_active: boolean;
}

interface AppState {
  // ── Données ──────────────────────────────────────────────────────────────
  transactions: Transaction[];
  portfolios: Prtfolios[];
  holdings: HoldingItem[];
  memberInvestments: MemberInvestment[];
  members: MemberItem[];

  // ── États de chargement ──────────────────────────────────────────────────
  loadingTransactions: boolean;
  loadingPortfolios: boolean;
  loadingHoldings: boolean;
  loadingMemberInvestments: boolean;
  loadingMembers: boolean;

  // ── Erreurs ──────────────────────────────────────────────────────────────
  errorTransactions: string | null;
  errorHoldings: string | null;
  errorMemberInvestments: string | null;
  errorMembers: string | null;

  // ── Actions fetch ────────────────────────────────────────────────────────
  fetchTransactions: () => Promise<void>;
  fetchPortfolios: () => Promise<void>;
  fetchHoldings: () => Promise<void>;
  fetchMemberInvestments: () => Promise<void>;
  fetchMembers: () => Promise<void>;

  // ── Actions CRUD holdings ────────────────────────────────────────────────
  createHolding: (data: Omit<HoldingItem, 'id' | 'last_updated'>) => Promise<void>;
  updateHolding: (id: number, data: Partial<HoldingItem>) => Promise<void>;
  deleteHolding: (id: number) => Promise<void>;

  // ── Utilitaires ──────────────────────────────────────────────────────────
  refreshAll: () => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set, get) => ({
  // ── État initial ──────────────────────────────────────────────────────────
  transactions: [],
  portfolios: [],
  holdings: [],
  memberInvestments: [],
  members: [],

  loadingTransactions: false,
  loadingPortfolios: false,
  loadingHoldings: false,
  loadingMemberInvestments: false,
  loadingMembers: false,

  errorTransactions: null,
  errorHoldings: null,
  errorMemberInvestments: null,
  errorMembers: null,

  // ── Fetch transactions ────────────────────────────────────────────────────
  fetchTransactions: async () => {
    set({ loadingTransactions: true, errorTransactions: null });
    try {
      const data = await AccountService.getAllTransactions();
      set({ transactions: data.transactions || [] });
    } catch (e) {
      set({ errorTransactions: 'Erreur lors du chargement des transactions' });
    } finally {
      set({ loadingTransactions: false });
    }
  },

  // ── Fetch portfolios ──────────────────────────────────────────────────────
  fetchPortfolios: async () => {
    set({ loadingPortfolios: true });
    try {
      const data = await AccountService.getAllPortfolios();
      set({ portfolios: Array.isArray(data) ? data : [] });
    } catch {
      // silencieux — les portfolios sont optionnels dans certaines vues
    } finally {
      set({ loadingPortfolios: false });
    }
  },

  // ── Fetch holdings ────────────────────────────────────────────────────────
  fetchHoldings: async () => {
    set({ loadingHoldings: true, errorHoldings: null });
    try {
      const response = await apiFetch(`${API_BASE_URL}/investment/holdings/`);
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      const data = await response.json();
      const holdingsArray: HoldingItem[] = Array.isArray(data)
        ? data
        : data.results || [];
      set({ holdings: holdingsArray });
    } catch (e) {
      set({ errorHoldings: 'Erreur lors du chargement des positions' });
    } finally {
      set({ loadingHoldings: false });
    }
  },

  // ── Fetch member investments ──────────────────────────────────────────────
  fetchMemberInvestments: async () => {
    set({ loadingMemberInvestments: true, errorMemberInvestments: null });
    try {
      const response = await apiFetch(`${API_BASE_URL}/investment/member/investments/`);
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      const data = await response.json();
      set({ memberInvestments: data.success ? data.investments : [] });
    } catch (e) {
      set({ errorMemberInvestments: 'Erreur lors du chargement des investissements' });
    } finally {
      set({ loadingMemberInvestments: false });
    }
  },

  // ── Fetch members (users list) ────────────────────────────────────────────
  fetchMembers: async () => {
    set({ loadingMembers: true, errorMembers: null });
    try {
      const response = await apiFetch(`${API_BASE_URL}/auth/users/`);
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      const data = await response.json();
      set({ members: data.users || [] });
    } catch (e) {
      set({ errorMembers: 'Erreur lors du chargement des membres' });
    } finally {
      set({ loadingMembers: false });
    }
  },  // ── CRUD holdings ─────────────────────────────────────────────────────────
  createHolding: async (holdingData) => {
    const response = await apiFetch(`${API_BASE_URL}/investment/holdings/`, {
      method: 'POST',
      body: JSON.stringify(holdingData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    await get().fetchHoldings();
  },

  updateHolding: async (id, holdingData) => {
    const response = await apiFetch(`${API_BASE_URL}/investment/holdings/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(holdingData),
    });
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    await get().fetchHoldings();
  },

  deleteHolding: async (id) => {
    const response = await apiFetch(`${API_BASE_URL}/investment/holdings/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    await get().fetchHoldings();
  },

  // ── Refresh global ────────────────────────────────────────────────────────
  refreshAll: async () => {
    const { fetchTransactions, fetchPortfolios, fetchHoldings, fetchMemberInvestments, fetchMembers } = get();
    await Promise.all([
      fetchTransactions(),
      fetchPortfolios(),
      fetchHoldings(),
      fetchMemberInvestments(),
      fetchMembers(),
    ]);
  },
}));
