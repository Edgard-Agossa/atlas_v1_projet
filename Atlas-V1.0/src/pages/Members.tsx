import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Plus, Mail, Phone, Calendar, DollarSign, TrendingUp, Crown, Star } from 'lucide-react';

const Members: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const membersData = [
    {
      id: '001',
      name: 'Alice Johnson',
      avatar: 'AJ',
      contact: '+1 555-0101',
      email: 'alice.johnson@email.com',
      joinDate: '2019-07-20',
      exitDate: null,
      investedCapital: 10000,
      equityValue: 10272,
      shares: 40.00,
      status: 'Active',
      profile: 'FLG Dynamique',
      tier: 'Premium',
      performance: '+2.72%',
      lastActivity: '2 hours ago'
    },
    {
      id: '002',
      name: 'Bob Williams',
      avatar: 'BW',
      contact: '+1 555-0102',
      email: 'bob.williams@email.com',
      joinDate: '2019-07-20',
      exitDate: null,
      investedCapital: 15000,
      equityValue: 15408,
      shares: 60.00,
      status: 'Active',
      profile: 'PHR Prudent',
      tier: 'Elite',
      performance: '+2.72%',
      lastActivity: '1 day ago'
    },
    {
      id: '003',
      name: 'Charlie Brown',
      avatar: 'CB',
      contact: '+1 555-0103',
      email: 'charlie.brown@email.com',
      joinDate: '2022-06-01',
      exitDate: '2023-12-31',
      investedCapital: 5000,
      equityValue: 0,
      shares: 0.00,
      status: 'Inactive',
      profile: 'FLG Dynamique',
      tier: 'Standard',
      performance: '0.00%',
      lastActivity: '3 months ago'
    },
    {
      id: '004',
      name: 'Diana Prince',
      avatar: 'DP',
      contact: '+1 555-0104',
      email: 'diana.prince@email.com',
      joinDate: '2023-01-15',
      exitDate: null,
      investedCapital: 25000,
      equityValue: 26850,
      shares: 75.00,
      status: 'Active',
      profile: 'PHR Équilibré',
      tier: 'Elite',
      performance: '+7.40%',
      lastActivity: '30 minutes ago'
    }
  ];

  const filteredMembers = membersData.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || member.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Elite': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'Premium': return <Star className="w-4 h-4 text-blue-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Elite': return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
      case 'Premium': return 'bg-gradient-to-r from-blue-500 to-blue-600';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

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
            <motion.h1 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-3xl font-bold text-gray-900 dark:text-white"
            >
              Members Management
            </motion.h1>
            <motion.p 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-gray-600 dark:text-gray-400"
            >
              Gestion des membres et investisseurs
            </motion.p>
          </div>
        </div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"
        >
          {[
            { label: 'Total Members', value: '4', change: '+1', icon: Users, color: 'blue' },
            { label: 'Active Members', value: '3', change: '0', icon: TrendingUp, color: 'green' },
            { label: 'Total Capital', value: '$50K', change: '+$25K', icon: DollarSign, color: 'purple' },
            { label: 'Avg Performance', value: '+3.21%', change: '+0.5%', icon: TrendingUp, color: 'orange' }
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
                  stat.color === 'green' ? 'text-green-500' :
                  stat.color === 'purple' ? 'text-purple-500' : 'text-orange-500'
                }`} />
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.change.startsWith('+') ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
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
        </motion.div>
      </motion.div>

      {/* Desktop Grid View */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {filteredMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.55 + index * 0.05 }}
            whileHover={{ scale: 1.02, y: -3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
          >
            {/* Member Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {member.avatar}
                </div>
                <div className={`absolute -top-1 -right-1 w-5 h-5 ${getTierColor(member.tier)} rounded-full flex items-center justify-center shadow-lg`}>
                  {getTierIcon(member.tier)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{member.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">ID: {member.id}</p>
              </div>
            </div>

            {/* Status */}
            <div className="mb-3">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                member.status === 'Active' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
              }`}>
                {member.status}
              </span>
            </div>

            {/* Financial Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Capital</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(member.investedCapital)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Valeur</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(member.equityValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Parts</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{member.shares}%</span>
                </div>
              </div>
            </div>

            {/* Profile */}
            <div className="text-center">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                {member.profile}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Mobile List View */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="md:hidden space-y-4"
      >
        {filteredMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.55 + index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  {member.avatar}
                </div>
                <div className={`absolute -top-1 -right-1 w-5 h-5 ${getTierColor(member.tier)} rounded-full flex items-center justify-center`}>
                  {getTierIcon(member.tier)}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{member.name}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    member.status === 'Active' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                  }`}>
                    {member.status}
                  </span>
                  <span className="text-xs text-gray-500">{member.profile}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Capital:</span>
                <span className="ml-1 font-semibold text-gray-900 dark:text-white">{formatCurrency(member.investedCapital)}</span>
              </div>
              <div>
                <span className="text-gray-500">Valeur:</span>
                <span className="ml-1 font-semibold text-gray-900 dark:text-white">{formatCurrency(member.equityValue)}</span>
              </div>
              <div>
                <span className="text-gray-500">Parts:</span>
                <span className="ml-1 font-semibold text-blue-600 dark:text-blue-400">{member.shares}%</span>
              </div>
              <div>
                <span className="text-gray-500">Perf:</span>
                <span className={`ml-1 font-semibold ${
                  member.performance.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {member.performance}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12"
        >
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aucun membre trouvé</h3>
          <p className="text-gray-600 dark:text-gray-400">Essayez de modifier vos critères de recherche</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Members;