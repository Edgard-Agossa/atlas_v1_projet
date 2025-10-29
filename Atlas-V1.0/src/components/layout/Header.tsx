import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X,
  Bell, 
  Sun, 
  Moon, 
  User,
  Settings,
  LogOut,
  ChevronDown,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';



interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, sidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState('dark');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const navigationItems = useMemo(() => [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Transactions', path: '/transactions' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Risk', path: '/risk' },
    { name: 'Reports', path: '/reports' },
    { name: 'Settings', path: '/settings' },
    { name: 'Members', path: '/members' },
    { name: 'Allocation', path: '/allocation' },
    { name: 'Track Record', path: '/track-record' },
    { name: 'Stress Test', path: '/stress-test' },
    { name: 'Stocks', path: '/stocks' },
    { name: 'Bonds', path: '/bonds' },
    { name: 'ETFs', path: '/etfs' },
    { name: 'REITs', path: '/reits' },
    { name: 'AI Report', path: '/ai-report' },
    { name: 'My Report', path: '/my-report' }
  ], []);

  const handleNavigation = (item: { name: string; path: string }) => {
    setActiveTab(item.name);
    navigate(item.path);
  };

  useEffect(() => {
    const currentPath = location.pathname;
    const currentItem = navigationItems.find(item => item.path === currentPath);
    if (currentItem) {
      setActiveTab(currentItem.name);
    }
  }, [location.pathname, navigationItems]);

  const notifications = [
    {
      id: 1,
      title: 'Nouveau dividende reçu',
      message: 'AAPL - €45.20',
      time: '2 min',
      unread: true
    },
    {
      id: 2,
      title: 'Alerte de prix',
      message: 'MSFT a atteint votre prix cible',
      time: '1h',
      unread: true
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target as Node)) {
        setShowMobileNav(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 sm:px-6 py-2 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-12 sm:h-14">
            {/* Left side - Logo and Brand */}
            <div className="flex items-center">
              <button
                onClick={onMenuClick}
                className="p-2 mr-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Phronesis</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">Capital</p>
                </div>
              </div>
            </div>

            {/* Center - Navigation (masqué sur mobile) */}
            <nav className="hidden lg:flex items-center space-x-1 flex-1 ml-4 xl:ml-8">
              {navigationItems.slice(0, 3).map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item)}
                  className={`px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.name
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-1 sm:space-x-2">

              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                  className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.firstName} className="w-8 h-8 rounded-full" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="hidden xl:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                    showUserMenu ? 'rotate-180' : ''
                  }`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-slate-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          {user?.avatar ? (
                            <img src={user.avatar} alt={user.firstName} className="w-8 h-8 rounded-full" />
                          ) : (
                            <User className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                        <Settings className="w-4 h-4 mr-3" />
                        Paramètres
                      </button>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                        <User className="w-4 h-4 mr-3" />
                        Profil
                      </button>
                      <div className="border-t border-gray-200 dark:border-slate-700 my-1"></div>
                      <button 
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {showMobileNav && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto">
            <nav className="px-4 py-3 space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    handleNavigation(item);
                    setShowMobileNav(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.name
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;