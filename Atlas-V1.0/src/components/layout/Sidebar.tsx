import React, { useEffect, useState } from 'react';
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
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { AccountService } from '../../contexts/DataUrl';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
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

  const [balance, setBalance] = useState({
    total: 0,
    loading: true,
    error: null as string | null
  });

  //Récupérer les soldes au chargement
  useEffect(() => {
    const fetchBalance = async () => {
      if (!user?.id) return;
      try {
        setBalance(prev => ({
          ...prev,
          loading: true,
          error: null
        }));

        const response = await AccountService.getTotalBalancesOfAuth(parseInt(user.id));
        console.log('Response des soldes :', response);
        if (response.success && response.accounts) {
            const totalBalance = response.accounts.reduce((sum, account) => sum + account.balance, 0);
           setBalance({ total: totalBalance, loading: false, error: null });
        } else {
                // ✅ Si pas de comptes, essayer de les créer automatiquement
        try {
          console.log('Aucun compte trouvé, création automatique...');
          await AccountService.createMemberAccounts(parseInt(user.id));
          
          // Réessayer de récupérer les soldes après création
          const retryResponse = await AccountService.getTotalBalancesOfAuth(parseInt(user.id));
          if (retryResponse.success && retryResponse.accounts) {
            const totalBalance = retryResponse.accounts.reduce((sum, account) => sum + account.balance, 0);
            setBalance({ total: totalBalance, loading: false, error: null });
          } else {
            setBalance({ total: 0, loading: false, error: null }); // Pas d'erreur, juste 0€
          }
        } catch (createError) {
          console.error('Erreur création comptes:', createError);
          setBalance({ total: 0, loading: false, error: null }); // Afficher 0€ au lieu d'une erreur
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des soldes :', error);
      setBalance({ 
        total: 0, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Erreur de connexion'
      });
    }
  };
  fetchBalance();
}, [user?.id]);


  // Formater le montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
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
          width: isOpen ? 280 : 0
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white dark:bg-gray-900 shadow-2xl border-r border-gray-200 dark:border-gray-700 overflow-hidden h-screen"
        style={{ position: 'fixed', left: 0, top: 0, zIndex: 50 }}
      >
        <div className="flex h-full flex-col">
          {/* Header fixe - Ne bouge jamais */}
          <div className="flex-shrink-0 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Valeur totale
           </p>
      {balance.loading ? (
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-20 rounded"></div>
      ) : balance.error ? (
        <p className="text-sm text-red-500">Erreur</p>
      ) : (
        <p className="text-xl font-bold text-green-600 dark:text-green-400">
          {formatAmount(balance.total)}
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