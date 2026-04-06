import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Edit, Trash2, Shield, ShieldCheck, Search,
  AlertCircle, CheckCircle, XCircle, Download, RefreshCw,
  Wallet, ToggleLeft, ToggleRight, X, Plus, Tag, Briefcase, DollarSign, Info,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import API_BASE_URL from '../config/api';
import { apiFetch } from '../utils/apiFetch';

interface UserItem {
  id: number; first_name: string; last_name: string; email: string;
  phone?: string; role: string | null; is_active: boolean;
  join_date: string;
}
interface RoleItem { id: number; name: string; description: string; users_count: number; }
interface MemberAccount {
  id: number; account_number: string; balance: number;
  portfolio: string; is_active: boolean;
}

interface PortfolioItem {
  id: number;
  name: string;
  type: string;
  cash: number;
  is_active: boolean;
  last_updated?: string;
  created_by?: { id: number; name: string } | null;
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });

const SYSTEM_ROLES = ['admin', 'member'];

const RoleBadge: React.FC<{ role: string | null }> = ({ role }) => {
  const cls = role === 'admin'
    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    : role === 'member'
    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <Tag className="w-3 h-3" />}
      {role ?? '—'}
    </span>
  );
};

const AdminUsersPro: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState<'users' | 'roles' | 'portfolios'>('users');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({ name: '', type: 'PHRONESIS', cash: '0' });
  const [editPortfolio, setEditPortfolio] = useState<PortfolioItem | null>(null);
  const [showDeletePortfolioModal, setShowDeletePortfolioModal] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);
  const [showPortfolioDetail, setShowPortfolioDetail] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [editRole, setEditRole] = useState<RoleItem | null>(null);
  const [accounts, setAccounts] = useState<MemberAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [userForm, setUserForm] = useState({
    first_name: '', last_name: '', email: '', password: 'Defaut@123',
    phone: '', role: 'member', is_active: true,
  });
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/auth/users/`);
      const d = await res.json();
      setUsers(d.users ?? []);
    } catch { setError('Erreur chargement'); }
    finally { setLoading(false); }
  }, []);

  const loadRoles = useCallback(async () => {
    setLoadingRoles(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/auth/roles/`);
      const d = await res.json();
      setRoles(d.roles ?? []);
    } catch {}
    finally { setLoadingRoles(false); }
  }, []);

  const loadPortfolios = useCallback(async () => {
    setLoadingPortfolios(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/investment/portfolio/`);
      const d = await res.json();
      setPortfolios(Array.isArray(d) ? d : []);
    } catch {}
    finally { setLoadingPortfolios(false); }
  }, []);

  const createPortfolio = async () => {
    setSaving(true); setError('');
    try {
      const url = editPortfolio
        ? `${API_BASE_URL}/investment/portfolio/${editPortfolio.id}/`
        : `${API_BASE_URL}/investment/portfolio/`;
      const method = editPortfolio ? 'PATCH' : 'POST';
      const body = editPortfolio
        ? JSON.stringify({ name: portfolioForm.name, cash: parseFloat(portfolioForm.cash) || 0 })
        : JSON.stringify({ name: portfolioForm.name, type: portfolioForm.type, cash: parseFloat(portfolioForm.cash) || 0 });
      const res = await apiFetch(url, { method, body });
      const d = await res.json();
      if (!res.ok) { setError(d.error || 'Erreur'); return; }
      setShowPortfolioModal(false);
      setEditPortfolio(null);
      setPortfolioForm({ name: '', type: 'PHRONESIS', cash: '0' });
      loadPortfolios();
    } catch { setError('Erreur réseau'); }
    finally { setSaving(false); }
  };

  const deletePortfolioFn = async () => {
    if (!selectedPortfolio) return;
    setSaving(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/investment/portfolio/${selectedPortfolio.id}/`, { method: 'DELETE' });
      const d = await res.json();
      if (!res.ok) { setError(d.error || 'Erreur suppression'); return; }
      setShowDeletePortfolioModal(false);
      setSelectedPortfolio(null);
      loadPortfolios();
    } catch { setError('Erreur réseau'); }
    finally { setSaving(false); }
  };

  useEffect(() => { loadUsers(); loadRoles(); loadPortfolios(); }, [loadUsers, loadRoles, loadPortfolios]);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(q);
    const matchR = roleFilter === 'all' || u.role === roleFilter;
    const matchS = statusFilter === 'all' || (statusFilter === 'active' ? u.is_active : !u.is_active);
    return matchQ && matchR && matchS;
  });

  const saveUser = async () => {
    setSaving(true); setError('');
    try {
      const url = editUser
        ? `${API_BASE_URL}/auth/users/${editUser.id}/`
        : `${API_BASE_URL}/auth/register/`;
      const method = editUser ? 'PUT' : 'POST';

      // En mode édition, on n'envoie pas le mot de passe (champ vide = inchangé)
      const body = editUser
        ? { first_name: userForm.first_name, last_name: userForm.last_name, email: userForm.email, phone: userForm.phone, role: userForm.role, is_active: userForm.is_active }
        : userForm;

      const res = await apiFetch(url, { method, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Erreur'); return; }
      setShowUserModal(false); setEditUser(null);
      setUserForm({ first_name: '', last_name: '', email: '', password: 'Defaut@123', phone: '', role: 'member', is_active: true });
      loadUsers();
    } catch { setError('Erreur réseau'); }
    finally { setSaving(false); }
  };

  const deleteUserFn = async () => {
    if (selectedUser === null) return;
    setSaving(true);
    try {
      await apiFetch(`${API_BASE_URL}/auth/users/${selectedUser.id}/`, { method: 'DELETE' });
      setShowDeleteModal(false); setSelectedUser(null); loadUsers();
    } catch { setError('Erreur suppression'); }
    finally { setSaving(false); }
  };

  const saveRole = async () => {
    setSaving(true); setError('');
    try {
      if (editRole) {
        await apiFetch(`${API_BASE_URL}/auth/roles/${editRole.id}/`, { method: 'PATCH', body: JSON.stringify(roleForm) });
      } else {
        const res = await apiFetch(`${API_BASE_URL}/auth/roles/`, { method: 'POST', body: JSON.stringify(roleForm) });
        if (!res.ok) { const d = await res.json(); setError(d.error || 'Erreur'); return; }
      }
      setShowRoleModal(false); setEditRole(null); setRoleForm({ name: '', description: '' }); loadRoles();
    } catch { setError('Erreur reseau'); }
    finally { setSaving(false); }
  };

  const deleteRole = async (id: number) => {
    if (!window.confirm('Supprimer ce role ?')) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/auth/roles/${id}/`, { method: 'DELETE' });
      const d = await res.json();
      if (d.success) loadRoles(); else setError(d.error);
    } catch { setError('Erreur suppression role'); }
  };

  const openAccounts = async (u: UserItem) => {
    setSelectedUser(u); setShowAccountsModal(true); setLoadingAccounts(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/investment/accounts/member/${u.id}/`);
      const d = await res.json();
      setAccounts(d.success ? d.accounts : []);
    } catch { setAccounts([]); }
    finally { setLoadingAccounts(false); }
  };

  const toggleAccount = async (id: number) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/investment/accounts/${id}/toggle-active/`, { method: 'PATCH' });
      const d = await res.json();
      if (d.success) {
        setAccounts(prev => prev.map(a => a.id === id ? { ...a, is_active: d.is_active } : a));
      } else {
        setError(d.error || 'Erreur lors de la modification du compte');
      }
    } catch {
      setError('Erreur réseau lors de la modification du compte');
    }
  };

  const exportCSV = () => {
    const rows = filtered.map(u =>
      [u.first_name + ' ' + u.last_name, u.email, u.role ?? '', u.is_active ? 'Actif' : 'Inactif', fmtDate(u.join_date)].join(',')
    ).join('\n');
    const csv = 'data:text/csv;charset=utf-8,Nom,Email,Role,Statut,Inscription\n' + rows;
    const a = document.createElement('a'); a.href = encodeURI(csv); a.download = 'utilisateurs.csv'; a.click();
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Acces reserve aux administrateurs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Administration</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Utilisateurs et Roles</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadUsers} className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          {tab === 'users' && (
            <>
              <button onClick={exportCSV} className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Download className="w-4 h-4 text-gray-500" />
              </button>
              <button onClick={() => { setEditUser(null); setUserForm({ first_name: '', last_name: '', email: '', password: 'Defaut@123', phone: '', role: 'member', is_active: true }); setShowUserModal(true); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors">
                <UserPlus className="w-4 h-4" /><span className="hidden sm:inline">Nouvel utilisateur</span>
              </button>
            </>
          )}
          {tab === 'roles' && (
            <button onClick={() => { setEditRole(null); setRoleForm({ name: '', description: '' }); setShowRoleModal(true); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors">
              <Plus className="w-4 h-4" /><span className="hidden sm:inline">Nouveau role</span>
            </button>
          )}
          {tab === 'portfolios' && (
            <button onClick={() => { setPortfolioForm({ name: '', type: 'PHRONESIS', cash: '0' }); setShowPortfolioModal(true); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors">
              <Plus className="w-4 h-4" /><span className="hidden sm:inline">Nouveau portfolio</span>
            </button>
          )}        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit gap-1">
        {([
          { key: 'users',      label: `Utilisateurs (${users.length})` },
          { key: 'roles',      label: `Rôles (${roles.length})` },
          { key: 'portfolios', label: `Portfolios (${portfolios.length})` },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              tab === t.key ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400 flex-1">{error}</p>
          <button onClick={() => setError('')}><XCircle className="w-5 h-5 text-red-400" /></button>
        </div>
      )}

      {/* TAB USERS */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400" />
            </div>
            <div className="flex gap-2">
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                className="flex-1 py-2 px-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white">
                <option value="all">Tous les roles</option>
                {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="flex-1 py-2 px-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white">
                <option value="all">Tous statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total', value: users.length, color: 'text-gray-900 dark:text-white' },
              { label: 'Actifs', value: users.filter(u => u.is_active).length, color: 'text-emerald-600' },
              { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'text-purple-600' },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-400 mb-0.5">{s.label}</p>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {['Utilisateur', 'Email', 'Role', 'Statut', 'Inscription', 'Actions'].map(h => (
                        <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {filtered.map((u, i) => (
                      <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {u.first_name.charAt(0)}{u.last_name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{u.first_name} {u.last_name}</p>
                              <p className="text-xs text-gray-400">ID: {u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                        <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {u.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {u.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(u.join_date)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openAccounts(u)} className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg" title="Comptes"><Wallet className="w-4 h-4 text-emerald-500" /></button>
                            <button onClick={() => { setEditUser(u); setUserForm({ first_name: u.first_name, last_name: u.last_name, email: u.email, password: '', phone: u.phone ?? '', role: u.role ?? 'member', is_active: u.is_active }); setShowUserModal(true); }} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit className="w-4 h-4 text-blue-500" /></button>
                            {u.id !== Number(currentUser?.id) && (
                              <button onClick={() => { setSelectedUser(u); setShowDeleteModal(true); }} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((u, i) => (
                  <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">{u.first_name.charAt(0)}{u.last_name.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{u.first_name} {u.last_name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openAccounts(u)} className="p-1.5 hover:bg-emerald-50 rounded-lg"><Wallet className="w-4 h-4 text-emerald-500" /></button>
                        <button onClick={() => { setEditUser(u); setUserForm({ first_name: u.first_name, last_name: u.last_name, email: u.email, password: '', phone: u.phone ?? '', role: u.role ?? 'member', is_active: u.is_active }); setShowUserModal(true); }} className="p-1.5 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4 text-blue-500" /></button>
                        {u.id !== Number(currentUser?.id) && <button onClick={() => { setSelectedUser(u); setShowDeleteModal(true); }} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <RoleBadge role={u.role} />
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {u.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{u.is_active ? 'Actif' : 'Inactif'}
                      </span>
                      <span className="text-xs text-gray-400">{fmtDate(u.join_date)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              {filtered.length === 0 && <div className="text-center py-10"><Users className="w-10 h-10 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-400">Aucun utilisateur</p></div>}
            </div>
          )}
        </div>
      )}

      {/* TAB ROLES */}
      {tab === 'roles' && (
        <div className="space-y-3">
          {loadingRoles ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role, i) => (
                <motion.div key={role.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${SYSTEM_ROLES.includes(role.name) ? 'bg-purple-100 dark:bg-purple-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
                        <Shield className={`w-4 h-4 ${SYSTEM_ROLES.includes(role.name) ? 'text-purple-600' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{role.name}</p>
                        {SYSTEM_ROLES.includes(role.name) && <span className="text-[10px] text-purple-500 font-medium">Systeme</span>}
                      </div>
                    </div>
                    {!SYSTEM_ROLES.includes(role.name) && (
                      <div className="flex gap-1">
                        <button onClick={() => { setEditRole(role); setRoleForm({ name: role.name, description: role.description }); setShowRoleModal(true); }} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit className="w-3.5 h-3.5 text-blue-500" /></button>
                        <button onClick={() => deleteRole(role.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-3 min-h-[32px]">{role.description || 'Aucune description'}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-400">{role.users_count} utilisateur{role.users_count > 1 ? 's' : ''}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SYSTEM_ROLES.includes(role.name) ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {SYSTEM_ROLES.includes(role.name) ? 'Protege' : 'Personnalise'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB PORTFOLIOS */}
      {tab === 'portfolios' && (
        <div className="space-y-4">
          {loadingPortfolios ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolios.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${p.type === 'PHRONESIS' ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-emerald-100 dark:bg-emerald-900/20'}`}>
                        <Briefcase className={`w-4 h-4 ${p.type === 'PHRONESIS' ? 'text-blue-600' : 'text-emerald-600'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{p.name}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${p.type === 'PHRONESIS' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {p.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {p.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {p.is_active ? 'Actif' : 'Inactif'}
                      </span>
                      <button onClick={() => { setSelectedPortfolio(p); setShowPortfolioDetail(true); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Détails">
                        <Info className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      <button onClick={() => { setEditPortfolio(p); setPortfolioForm({ name: p.name, type: p.type, cash: String(p.cash) }); setShowPortfolioModal(true); }} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Modifier">
                        <Edit className="w-3.5 h-3.5 text-blue-500" />
                      </button>
                      <button onClick={() => { setSelectedPortfolio(p); setShowDeletePortfolioModal(true); }} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Supprimer">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">Cash :</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(p.cash)} CFA
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Card "Créer un portfolio" */}
              <motion.button
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: portfolios.length * 0.05 }}
                onClick={() => { setPortfolioForm({ name: '', type: 'PHRONESIS', cash: '0' }); setShowPortfolioModal(true); }}
                className="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group min-h-[120px]"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 group-hover:text-blue-600 transition-colors">
                  Créer un portfolio
                </p>
              </motion.button>
            </div>
          )}
          {portfolios.length === 0 && !loadingPortfolios && (
            <div className="text-center py-8 text-gray-400 text-sm">Aucun portfolio trouvé</div>
          )}
        </div>
      )}

      {/* MODAL PORTFOLIO */}
      <AnimatePresence>
        {showPortfolioModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Créer un portfolio</h3>
                </div>
                <button onClick={() => setShowPortfolioModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Nom du portfolio *</label>
                  <input
                    type="text"
                    value={portfolioForm.name}
                    onChange={e => setPortfolioForm(f => ({ ...f, name: e.target.value }))}
                    className="input-field text-sm"
                    placeholder="ex: Phronesis Capital"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Type *</label>
                  <select
                    value={portfolioForm.type}
                    onChange={e => setPortfolioForm(f => ({ ...f, type: e.target.value }))}
                    className="input-field text-sm"
                  >
                    <option value="PHRONESIS">PHRONESIS — Passif</option>
                    <option value="FLAGSHIP">FLAGSHIP — Actif</option>
                    <option value="FLG">FLG</option>
                    <option value="PHR">PHR</option>
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Corps envoyé : <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                      {`{"name": "${portfolioForm.name || '...'}", "type": "${portfolioForm.type}"}`}
                    </code>
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Cash initial (CFA)</label>
                  <input
                    type="number"
                    value={portfolioForm.cash}
                    onChange={e => setPortfolioForm(f => ({ ...f, cash: e.target.value }))}
                    className="input-field text-sm"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button onClick={() => setShowPortfolioModal(false)} className="btn-secondary text-sm">Annuler</button>
                <button onClick={createPortfolio} disabled={saving || !portfolioForm.name}
                  className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
                  {saving && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  Créer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL USER */}
      <AnimatePresence>
        {showUserModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white dark:bg-gray-950 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

              {/* Header avec gradient */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                      {editUser
                        ? <Edit className="w-4 h-4 text-white" />
                        : <UserPlus className="w-4 h-4 text-white" />
                      }
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {editUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                      </h3>
                      {editUser && (
                        <p className="text-blue-200 text-xs mt-0.5">{editUser.email}</p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setShowUserModal(false)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Formulaire */}
              <div className="px-6 py-5 space-y-4">
                {/* Prénom + Nom */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Prénom *</label>
                    <input
                      type="text"
                      value={userForm.first_name}
                      onChange={e => setUserForm(f => ({...f, first_name: e.target.value}))}
                      className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
                      placeholder="Jean"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Nom *</label>
                    <input
                      type="text"
                      value={userForm.last_name}
                      onChange={e => setUserForm(f => ({...f, last_name: e.target.value}))}
                      className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
                      placeholder="Dupont"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={e => setUserForm(f => ({...f, email: e.target.value}))}
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="jean.dupont@email.com"
                  />
                </div>

                {/* Mot de passe — seulement à la création */}
                {!editUser && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Mot de passe *</label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={e => setUserForm(f => ({...f, password: e.target.value}))}
                      className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                      placeholder="Defaut@123"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Défaut : Defaut@123</p>
                  </div>
                )}

                {/* Téléphone + Rôle */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Téléphone</label>
                    <input
                      type="tel"
                      value={userForm.phone}
                      onChange={e => setUserForm(f => ({...f, phone: e.target.value}))}
                      className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
                      placeholder="+229 XX XX XX XX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Rôle</label>
                    <select
                      value={userForm.role}
                      onChange={e => setUserForm(f => ({...f, role: e.target.value}))}
                      className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    >
                      {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Statut — seulement en édition */}
                {editUser && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Compte actif</p>
                      <p className="text-xs text-gray-400">L'utilisateur peut se connecter</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUserForm(f => ({...f, is_active: !f.is_active}))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${userForm.is_active ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${userForm.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
                <button onClick={() => setShowUserModal(false)} className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                  Annuler
                </button>
                <button onClick={saveUser} disabled={saving || !userForm.first_name || !userForm.email}
                  className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl transition-colors flex items-center gap-2">
                  {saving && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  {editUser ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL ROLE */}
      <AnimatePresence>
        {showRoleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{editRole ? 'Modifier' : 'Creer'} un role</h3>
                <button onClick={() => setShowRoleModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nom du role *</label>
                  <input type="text" value={roleForm.name} onChange={e => setRoleForm(f => ({...f, name: e.target.value}))} className="input-field text-sm" placeholder="ex: analyste" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                  <textarea value={roleForm.description} onChange={e => setRoleForm(f => ({...f, description: e.target.value}))} className="input-field text-sm resize-none" rows={3} placeholder="Description..." />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button onClick={() => setShowRoleModal(false)} className="btn-secondary text-sm">Annuler</button>
                <button onClick={saveRole} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                  {saving && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  {editRole ? 'Enregistrer' : 'Creer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL COMPTES */}
      <AnimatePresence>
        {showAccountsModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                    {selectedUser.first_name.charAt(0)}{selectedUser.last_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedUser.first_name} {selectedUser.last_name}</p>
                    <p className="text-xs text-gray-400">Portfolios</p>
                  </div>
                </div>
                <button onClick={() => setShowAccountsModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="px-6 py-4">
                {loadingAccounts ? (
                  <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : accounts.length === 0 ? (
                  <div className="text-center py-8">
                    <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-3">Aucun compte trouve</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {accounts.map(acc => (
                      <div key={acc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${acc.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{acc.portfolio}</p>
                            <p className="text-xs text-gray-400">{acc.account_number}</p>
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">{new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(acc.balance)} CFA</p>
                          </div>
                        </div>
                        <button onClick={() => toggleAccount(acc.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${acc.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                          {acc.is_active ? <><ToggleRight className="w-4 h-4" />Actif</> : <><ToggleLeft className="w-4 h-4" />Inactif</>}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button onClick={() => setShowAccountsModal(false)} className="btn-secondary text-sm">Fermer</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DELETE */}
      <AnimatePresence>
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Supprimer l'utilisateur</h3>
              <p className="text-sm text-gray-500 mb-5">Supprimer <span className="font-semibold text-gray-900 dark:text-white">{selectedUser.first_name} {selectedUser.last_name}</span> ?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 btn-secondary text-sm">Annuler</button>
                <button onClick={deleteUserFn} disabled={saving} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                  {saving && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DETAIL PORTFOLIO */}
      <AnimatePresence>
        {showPortfolioDetail && selectedPortfolio && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

              {/* Header coloré */}
              <div className={`px-6 py-5 ${selectedPortfolio.type === 'PHRONESIS' || selectedPortfolio.type === 'PHR' ? 'bg-gradient-to-r from-blue-600 to-blue-800' : 'bg-gradient-to-r from-emerald-600 to-emerald-800'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-base">{selectedPortfolio.name}</p>
                      <span className="text-white/70 text-xs">{selectedPortfolio.type}</span>
                    </div>
                  </div>
                  <button onClick={() => setShowPortfolioDetail(false)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Infos */}
              <div className="px-6 py-4 space-y-3">
                {[
                  { label: 'ID', value: `#${selectedPortfolio.id}` },
                  { label: 'Nom', value: selectedPortfolio.name },
                  { label: 'Type', value: selectedPortfolio.type },
                  {
                    label: 'Cash',
                    value: new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(selectedPortfolio.cash) + ' CFA',
                  },
                  {
                    label: 'Statut',
                    value: selectedPortfolio.is_active ? 'Actif' : 'Inactif',
                    badge: selectedPortfolio.is_active ? 'emerald' : 'red',
                  },
                  {
                    label: 'Créé par',
                    value: selectedPortfolio.created_by ? selectedPortfolio.created_by.name : '—',
                  },
                  {
                    label: 'Dernière mise à jour',
                    value: selectedPortfolio.last_updated
                      ? new Date(selectedPortfolio.last_updated).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : '—',
                  },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{row.label}</span>
                    {row.badge ? (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.badge === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {row.value}
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-gray-900 dark:text-white text-right max-w-[180px] truncate">{row.value}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions rapides */}
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                <button
                  onClick={() => { setShowPortfolioDetail(false); setEditPortfolio(selectedPortfolio); setPortfolioForm({ name: selectedPortfolio.name, type: selectedPortfolio.type, cash: String(selectedPortfolio.cash) }); setShowPortfolioModal(true); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <Edit className="w-4 h-4" /> Modifier
                </button>
                <button
                  onClick={() => { setShowPortfolioDetail(false); setShowDeletePortfolioModal(true); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DELETE PORTFOLIO */}
      <AnimatePresence>
        {showDeletePortfolioModal && selectedPortfolio && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Supprimer le portfolio</h3>
              <p className="text-sm text-gray-500 mb-1">Supprimer <span className="font-semibold text-gray-900 dark:text-white">{selectedPortfolio.name}</span> ?</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-5">Les comptes membres liés doivent être désactivés au préalable.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeletePortfolioModal(false)} className="flex-1 btn-secondary text-sm">Annuler</button>
                <button onClick={deletePortfolioFn} disabled={saving} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                  {saving && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminUsersPro;
