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
      <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 shadow-lg sticky top-0 z-50 pl-6 ">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Menu + Brand */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onMenuClick}
                className="group p-2.5 rounded-xl bg-gray-50/80 hover:bg-blue-50 dark:bg-gray-800/50 dark:hover:bg-blue-900/30 transition-all duration-300 hover:shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300/50"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                )}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {/* <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div> */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl opacity-20 blur-sm"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                    Quantum
                  </h1>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 -mt-0.5">Capital</p>
                </div>
              </div>
            </div>

            {/* Center - Navigation */}
            <nav className="hidden lg:flex items-center space-x-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-1.5 border border-gray-200/50 dark:border-gray-700/50">
              {navigationItems.slice(0, 3).map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item)}
                  className={`relative px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    activeTab === item.name
                      ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-lg border border-blue-200/50 dark:border-blue-700/50'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {item.name}
                  {activeTab === item.name && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl"></div>
                  )}
                </button>
              ))}
            </nav>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="group p-2.5 rounded-xl bg-gray-50/80 hover:bg-yellow-50 dark:bg-gray-800/50 dark:hover:bg-yellow-900/20 transition-all duration-300 hover:shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-yellow-300/50"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-600 group-hover:text-yellow-500 transition-colors" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                )}
              </button>

              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                  className="group relative p-2.5 rounded-xl bg-gray-50/80 hover:bg-red-50 dark:bg-gray-800/50 dark:hover:bg-red-900/20 transition-all duration-300 hover:shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-red-300/50"
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  </div>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-all duration-200 cursor-pointer"
                        >
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
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
                  className="group flex items-center space-x-3 px-4 py-2.5 rounded-xl bg-gray-50/80 hover:bg-blue-50 dark:bg-gray-800/50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300/50"
                >
                  <div className="relative">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm"></div>
                  </div>
                  <div className="hidden xl:block text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.role === 'admin' ? 'Administrator' : 'Member'}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 ${
                    showUserMenu ? 'rotate-180' : ''
                  }`} />
                </button>


                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                          </div>
                          <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl opacity-30 blur-sm"></div>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">
                            {user?.role === 'admin' ? 'Administrator' : 'Member'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 rounded-xl transition-all duration-200">
                        <Settings className="w-5 h-5 mr-3 text-gray-500" />
                        Settings
                      </button>
                      <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 rounded-xl transition-all duration-200">
                        <User className="w-5 h-5 mr-3 text-gray-500" />
                        Profile
                      </button>
                      <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
                      <button 
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign out
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