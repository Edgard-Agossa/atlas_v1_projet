import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
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
import AdminUsers from './pages/AdminUsers';
import { useClubData } from './hooks/useClubData';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const clubData = useClubData();
  useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
              <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-280' : 'ml-0'}`}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
                
                <main className="bg-gray-50 dark:bg-gray-900 min-h-screen">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/portfolio" element={<Portfolio {...clubData} />} />
                      <Route path="/transactions" element={<Transactions />} />
                      <Route path="/members" element={<Members />} />
                      <Route path="/analytics" element={<Analytics />} />
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
                      <Route path="/admin/users" element={<AdminUsers />} />
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