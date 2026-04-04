import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, Edit, Trash2, Shield, ShieldCheck, Search, Filter,
  AlertCircle, CheckCircle, XCircle, Download, RefreshCw, Mail, Phone, Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import API_BASE_URL from '../config/api';

interface User {
  id: number; first_name: string; last_name: string; email: string;
  phone?: string; avatar?: string; role: 'admin' | 'member';
  is_active: boolean; join_date: string; last_login?: string;
}

const AdminUsersPro: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'member'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User>>({});
  const [creatingUser, setCreatingUser] = useState<Partial<User & { password: string }>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      setError('Accès non autorisé. Vous devez être administrateur pour accéder à cette page.');
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors du chargement des utilisateurs');
      }
    } catch (err) {
      setError('Erreur réseau. Vérifiez que le serveur backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.first_name} ${user.last_name} ${user.email}`
      .toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = () => {
    setCreatingUser({ first_name: '', last_name: '', email: '', phone: '', password: 'Defaut@123', role: 'member', is_active: true });
    setShowCreateModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditingUser({ first_name: user.first_name, last_name: user.last_name, email: user.email, phone: user.phone || '', role: user.role, is_active: user.is_active });
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const createUser = async () => {
    if (!creatingUser.first_name || !creatingUser.last_name || !creatingUser.email || !creatingUser.password) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ first_name: creatingUser.first_name, last_name: creatingUser.last_name, email: creatingUser.email, password: creatingUser.password, phone: creatingUser.phone, role: creatingUser.role }),
      });
      if (response.ok) {
        const data = await response.json();
        setUsers([...users, data.user]);
        setShowCreateModal(false);
        setCreatingUser({});
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la création');
      }
    } catch (err) {
      setError('Erreur réseau lors de la création');
    } finally {
      setSaving(false);
    }
  };

  const saveUserChanges = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/${selectedUser.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(editingUser),
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...data.user } : u));
        setShowEditModal(false);
        setSelectedUser(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      setError('Erreur réseau lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/${selectedUser.id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        setUsers(users.filter(u => u.id !== selectedUser.id));
        setShowDeleteModal(false);
        setSelectedUser(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur réseau lors de la suppression');
    } finally {
      setSaving(false);
    }
  };

  const exportUsers = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Nom,Prénom,Email,Téléphone,Rôle,Statut,Date d'inscription\n" +
      filteredUsers.map(u =>
        `${u.last_name},${u.first_name},${u.email},${u.phone || ''},${u.role === 'admin' ? 'Administrateur' : 'Membre'},${u.is_active ? 'Actif' : 'Inactif'},${new Date(u.join_date).toLocaleDateString('fr-FR')}`
      ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "utilisateurs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Accès refusé</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Gérez les comptes et leurs permissions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Stats compactes */}
          <div className="hidden sm:flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-2">
            {[
              { label: 'Total', value: filteredUsers.length, color: 'text-gray-900 dark:text-white' },
              { label: 'Actifs', value: filteredUsers.filter(u => u.is_active).length, color: 'text-emerald-600' },
              { label: 'Admins', value: filteredUsers.filter(u => u.role === 'admin').length, color: 'text-purple-600' },
            ].map((s, i) => (
              <div key={i} className="text-center px-2 first:pl-0 last:pr-0 border-r border-gray-100 dark:border-gray-800 last:border-0">
                <p className="text-[10px] text-gray-400">{s.label}</p>
                <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
          <button onClick={fetchUsers} className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" title="Actualiser">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={exportUsers} className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" title="Exporter">
            <Download className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={handleCreateUser} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouvel utilisateur</span>
          </button>
        </div>
      </div>

      {/* ── Stats mobile ───────────────────────────────────────────────── */}
      <div className="flex sm:hidden items-center gap-2">
        {[
          { label: 'Total', value: filteredUsers.length, color: 'text-gray-900 dark:text-white' },
          { label: 'Actifs', value: filteredUsers.filter(u => u.is_active).length, color: 'text-emerald-600' },
          { label: 'Admins', value: filteredUsers.filter(u => u.role === 'admin').length, color: 'text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-gray-400">{s.label}</p>
            <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filtres ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)}
                className="w-full sm:w-auto pl-9 pr-7 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white appearance-none cursor-pointer">
                <option value="all">Tous les rôles</option>
                <option value="admin">Admins</option>
                <option value="member">Membres</option>
              </select>
            </div>
            <div className="relative flex-1 sm:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
                className="w-full sm:w-auto pl-9 pr-7 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white appearance-none cursor-pointer">
                <option value="all">Tous statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Erreur ─────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400 flex-1">{error}</p>
          <button onClick={() => setError('')}><XCircle className="w-5 h-5 text-red-400" /></button>
        </div>
      )}

      {/* ── Tableau desktop / Cards mobile ─────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">

        {/* Tableau — masqué sur mobile */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {['Utilisateur', 'Contact', 'Rôle', 'Statut', 'Inscription', 'Actions'].map(h => (
                  <th key={h} className={`px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredUsers.map((user, idx) => (
                <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                  className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-gray-400">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" />{user.email}</p>
                    {user.phone && <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1"><Phone className="w-3.5 h-3.5" />{user.phone}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'}`}>
                      {user.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                      {user.role === 'admin' ? 'Admin' : 'Membre'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>
                      {user.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {user.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(user.join_date)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEditUser(user)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Modifier">
                        <Edit className="w-4 h-4 text-blue-500" />
                      </button>
                      {user.id !== Number(currentUser?.id) && (
                        <button onClick={() => handleDeleteUser(user)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Supprimer">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards mobile */}
        <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
          {filteredUsers.map((user, idx) => (
            <motion.div key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
              className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEditUser(user)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    <Edit className="w-4 h-4 text-blue-500" />
                  </button>
                  {user.id !== Number(currentUser?.id) && (
                    <button onClick={() => handleDeleteUser(user)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {user.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                  {user.role === 'admin' ? 'Admin' : 'Membre'}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {user.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {user.is_active ? 'Actif' : 'Inactif'}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(user.join_date)}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* ── Modal Créer ────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Créer un utilisateur</h3>
              <button onClick={() => setShowCreateModal(false)}><XCircle className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Prénom *</label>
                  <input type="text" value={creatingUser.first_name || ''} onChange={e => setCreatingUser({...creatingUser, first_name: e.target.value})} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nom *</label>
                  <input type="text" value={creatingUser.last_name || ''} onChange={e => setCreatingUser({...creatingUser, last_name: e.target.value})} className="input-field text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email *</label>
                <input type="email" value={creatingUser.email || ''} onChange={e => setCreatingUser({...creatingUser, email: e.target.value})} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Mot de passe *</label>
                <input type="password" value={creatingUser.password || ''} onChange={e => setCreatingUser({...creatingUser, password: e.target.value})} className="input-field text-sm" placeholder="Defaut@123" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Téléphone</label>
                <input type="tel" value={creatingUser.phone || ''} onChange={e => setCreatingUser({...creatingUser, phone: e.target.value})} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Rôle</label>
                <select value={creatingUser.role || 'member'} onChange={e => setCreatingUser({...creatingUser, role: e.target.value as any})} className="input-field text-sm">
                  <option value="member">Membre</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="btn-secondary text-sm">Annuler</button>
              <button onClick={createUser} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                {saving && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                Créer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Modal Modifier ─────────────────────────────────────────────── */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Modifier l'utilisateur</h3>
              <button onClick={() => setShowEditModal(false)}><XCircle className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Prénom</label>
                  <input type="text" value={editingUser.first_name || ''} onChange={e => setEditingUser({...editingUser, first_name: e.target.value})} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nom</label>
                  <input type="text" value={editingUser.last_name || ''} onChange={e => setEditingUser({...editingUser, last_name: e.target.value})} className="input-field text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                <input type="email" value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Téléphone</label>
                <input type="tel" value={editingUser.phone || ''} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Rôle</label>
                <select value={editingUser.role || 'member'} onChange={e => setEditingUser({...editingUser, role: e.target.value as any})} className="input-field text-sm">
                  <option value="member">Membre</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="edit_active" checked={editingUser.is_active || false} onChange={e => setEditingUser({...editingUser, is_active: e.target.checked})} className="h-4 w-4 text-blue-600 rounded" />
                <label htmlFor="edit_active" className="text-sm text-gray-700 dark:text-gray-300">Compte actif</label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="btn-secondary text-sm">Annuler</button>
              <button onClick={saveUserChanges} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                {saving && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                Enregistrer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Modal Supprimer ────────────────────────────────────────────── */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Supprimer l'utilisateur</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Êtes-vous sûr de vouloir supprimer <span className="font-semibold text-gray-900 dark:text-white">{selectedUser.first_name} {selectedUser.last_name}</span> ?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 btn-secondary text-sm">Annuler</button>
              <button onClick={deleteUser} disabled={saving} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                {saving && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                Supprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default AdminUsersPro;
