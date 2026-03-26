import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Plus, DollarSign, TrendingUp, Crown, Star } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const Members: React.FC = () => {
  const { members, loadingMembers } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredMembers = members.filter(member => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && member.is_active) ||
      (filterStatus === 'inactive' && !member.is_active);
    return matchesSearch && matchesFilter;
  });

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.is_active).length;

  // Initiales pour l'avatar
  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  // Tier basé sur le rôle
  const getTier = (role: string | null) => (role === 'admin' ? 'Elite' : 'Standard');

  const getTierIcon = (tier: string) => {
    if (tier === 'Elite') return <Crown className="w-4 h-4 text-yellow-500" />;
    return <Users className="w-4 h-4 text-gray-500" />;
  };

  const getTierColor = (tier: string) =>
    tier === 'Elite'
      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
      : 'bg-gradient-to-r from-gray-500 to-gray-600';

  if (loadingMembers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-lg p-1">
            <img src="/PHRONESIS - Bleue.png" alt="Phronesis Capital" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Members Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Gestion des membres et investisseurs</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[
            { label: 'Total Members', value: totalMembers.toString(), icon: Users, color: 'blue' },
            { label: 'Active Members', value: activeMembers.toString(), icon: TrendingUp, color: 'green' },
            { label: 'Inactive Members', value: (totalMembers - activeMembers).toString(), icon: DollarSign, color: 'purple' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-5 h-5 ${
                  stat.color === 'blue' ? 'text-blue-500' :
                  stat.color === 'green' ? 'text-green-500' : 'text-purple-500'
                }`} />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Membre</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMembers.map((member, index) => {
          const tier = getTier(member.role);
          const initials = getInitials(member.first_name, member.last_name);
          return (
            <motion.div
              key={member.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.05 + index * 0.04 }}
              whileHover={{ scale: 1.02, y: -3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
            >
              {/* Avatar + nom */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {initials}
                  </div>
                  <div className={`absolute -top-1 -right-1 w-5 h-5 ${getTierColor(tier)} rounded-full flex items-center justify-center shadow-lg`}>
                    {getTierIcon(tier)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {member.first_name} {member.last_name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.email}</p>
                </div>
              </div>

              {/* Statut */}
              <div className="mb-3">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  member.is_active
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                }`}>
                  {member.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>

              {/* Infos */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Rôle</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">{member.role || 'member'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Inscrit le</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(member.join_date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {member.phone && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Tél</span>
                    <span className="font-medium text-gray-900 dark:text-white">{member.phone}</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && !loadingMembers && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aucun membre trouvé</h3>
          <p className="text-gray-600 dark:text-gray-400">Essayez de modifier vos critères de recherche</p>
        </div>
      )}
    </motion.div>
  );
};

export default Members;
