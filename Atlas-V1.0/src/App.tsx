import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import PortfolioSimple from './pages/PortfolioSimple';
import Transactions from './pages/Transactions';
import Members from './pages/Members';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import TrackRecord from './pages/TrackRecord';
import Risk from './pages/Risk';
import StressTest from './pages/StressTest';
import Stocks from './pages/Stocks';
import Bonds from './pages/Bonds';
import ETFs from './pages/ETFs';
import REITs from './pages/REITs';
import AIReport from './pages/AIReport';
import MyReport from './pages/MyReport';
import Allocation from './pages/Allocation';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import AdminUsersPro from './pages/AdminUsersPro';
import AdminMemberAccounts from './pages/AdminMemberAccounts';
import PortfolioSnapshot from './pages/PortfolioSnapshot';
import MarketTicker from './components/MarketTicker';
import InactivityModal from './components/InactivityModal';
import { useClubData } from './hooks/useClubData';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useAppStore } from './store/useAppStore';
import { useInactivityDetector } from './hooks/useInactivityDetector';

const AppContent: React.FC = () => {
  // Fermée par défaut sur mobile, ouverte sur desktop
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Ferme la sidebar quand on passe en mobile, ouvre quand on passe en desktop
  React.useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (!desktop) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const clubData = useClubData();
  const { isAuthenticated, logout } = useAuth();
  const refreshAll = useAppStore((s) => s.refreshAll);

  // 🔒 Détecteur d'inactivité avec modal de confirmation
  const {
    showWarning,
    timeLeft,
    handleStayConnected,
  } = useInactivityDetector({
    inactivityTimeout: 10* 60 * 1000,  // 5 minutes d'inactivité
    warningDuration: 20 * 1000,         // 20 secondes pour répondre
    onLogout: logout,
    enabled: isAuthenticated,
  });

  // Rafraîchir toutes les données quand l'utilisateur continue sa session
  const handleContinueSession = React.useCallback(() => {
    handleStayConnected();
    refreshAll(); // Rafraîchir les données
  }, [handleStayConnected, refreshAll]);

  // Charge toutes les données dès que l'utilisateur est connecté
  React.useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    }
  }, [isAuthenticated, refreshAll]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 🔔 Modal d'inactivité */}
      <InactivityModal
        isOpen={showWarning}
        onStayConnected={handleContinueSession}
        timeLeft={timeLeft}
      />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/change-password" element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        } />
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
              <div
                style={{ marginLeft: isDesktop && sidebarOpen ? 280 : 0 }}
                className="transition-all duration-300"
              >
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
                <MarketTicker />
                
                <main className="bg-gray-50 dark:bg-gray-900 min-h-screen">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/portfolio" element={<PortfolioSimple />} />
                      <Route path="/transactions" element={<Transactions />} />
                      <Route path="/members" element={<Members />} />
                      <Route path="/analytics" element={<Analytics performanceHistory={clubData.performanceHistory} portfolios={clubData.portfolios} transactions={clubData.transactions} />} />
                      <Route path="/track-record" element={<TrackRecord />} />
                      <Route path="/risk" element={<Risk />} />
                      <Route path="/stress-test" element={<StressTest />} />
                      <Route path="/stocks" element={<Stocks />} />
                      <Route path="/bonds" element={<Bonds />} />
                      <Route path="/etfs" element={<ETFs />} />
                      <Route path="/reits" element={<REITs />} />
                      <Route path="/allocation" element={<Allocation />} />
                      <Route path="/ai-report" element={<AIReport />} />
                      <Route path="/my-report" element={<MyReport />} />
                      <Route path="/reports" element={<Reports {...clubData} />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/recapitulatif" element={<PortfolioSnapshot />} />
                      <Route path="/admin/users" element={
                        <ProtectedRoute adminOnly={true}>
                          <AdminUsersPro />
                        </ProtectedRoute>
                      } />
                      <Route path="/admin/accounts" element={
                        <ProtectedRoute adminOnly={true}>
                          <AdminMemberAccounts />
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </div>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;