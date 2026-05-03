import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  ArrowUpDown,
  Users,
  BarChart3,
  FileText,
  Settings,
  TrendingUp,
  Wallet,
  Shield,
  TableProperties,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useAppStore } from '../../store/useAppStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Portfolio Global', href: '/recapitulatif', icon: TableProperties },
  { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { name: 'Transactions', href: '/transactions', icon: ArrowUpDown },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Risk', href: '/risk', icon: BarChart3 },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Allocation', href: '/allocation', icon: Briefcase },
  { name: 'Track Record', href: '/track-record', icon: TrendingUp },
  { name: 'Stress Test', href: '/stress-test', icon: BarChart3 },
  { name: 'Stocks', href: '/stocks', icon: TrendingUp },
  { name: 'Bonds', href: '/bonds', icon: Wallet },
  { name: 'ETFs', href: '/etfs', icon: BarChart3 },
  { name: 'REITs', href: '/reits', icon: TrendingUp },
  { name: 'AI Report', href: '/ai-report', icon: FileText },
  { name: 'My Report', href: '/my-report', icon: FileText },
  { name: 'Admin Users', href: '/admin/users', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { memberInvestments, loadingMemberInvestments } = useAppStore();

  // Valeur totale = somme des gross_value des deux portfolios de l'utilisateur connecté
  const totalGrossValue = useMemo(() =>
    memberInvestments.reduce((sum, inv) => sum + inv.gross_value, 0),
  [memberInvestments]);

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' CFA';
  // Filtrer la navigation selon le rôle de l'utilisateur
  const filteredNavigation = navigation.filter(item => {
    if (item.name === 'Admin Users' && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <motion.div
        initial={false}
        animate={{
          width: isOpen ? 280 : 0,
          x: isOpen ? 0 : -10,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white dark:bg-gray-900 shadow-2xl border-r border-gray-200 dark:border-gray-700 overflow-hidden h-screen"
        style={{ position: 'fixed', left: 0, top: 0, zIndex: 50 }}
      >
        <div className="flex h-full flex-col">
          {/* Header fixe - Ne bouge jamais */}
          <div className="flex-shrink-0 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-lg p-1">
                <img src="/PHRONESIS - Bleue.png" alt="Phronesis Capital" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.role === 'admin' ? 'Admin' : 'Membre'}</p>
              </div>
            </div>

            {/* Valeur totale */}
            <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg">
                <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Valeur totale
                </p>
                {loadingMemberInvestments ? (
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-20 rounded mt-1" />
                ) : (
                  <p className="text-base font-bold text-green-600 dark:text-green-400 truncate">
                    {formatAmount(totalGrossValue)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation scrollable - Seule cette partie scroll */}
          <div className="flex-1 overflow-y-auto modern-scrollbar">
            <nav className="p-4 space-y-1">
              {filteredNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group relative ${isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm border-l-4 border-blue-500'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:shadow-sm'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                      {isActive && (
                        <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Espace en bas pour éviter que le dernier élément soit coupé */}
            <div className="h-4" />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
