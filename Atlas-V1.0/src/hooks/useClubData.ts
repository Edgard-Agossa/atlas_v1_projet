import { useState, useMemo, useEffect } from 'react';
import { 
  Transaction, 
  Member, 
  Holding, 
  Portfolio, 
  PerformanceDataPoint, 
  TransactionType, 
  PortfolioType, 
  MemberStatus,
  DashboardStats
} from '../types';

import API_BASE_URL from '../config/api';


export const useClubData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [portfolios, setPortfolios] = useState<{ [key in PortfolioType]: Portfolio }>({} as any);

  const fetchHoldings = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/investment/holdings/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const rawHoldings = await response.json();
      const processedHoldings = rawHoldings.results.map((h: any) => {
        const invested = h.avg_price * h.quantity;
        const marketValue = h.current_price * h.quantity;
        const unrealizedGain = marketValue - invested;
        const unrealizedGainPercent = invested > 0 ? (unrealizedGain / invested) * 100 : 0;

        return {
          id: h.id,
          asset: h.asset,
          symbol: h.symbol,
          name: h.name,
          quantity: h.quantity,
          avgPrice: h.avg_price,
          averageCost: h.avg_price, // or calculate as needed
          currentPrice: h.current_price,
          marketValue: marketValue,
          unrealizedGain: unrealizedGain,
          unrealizedGainLoss: unrealizedGain, // or calculate as needed
          unrealizedGainPercent: unrealizedGainPercent,
          portfolio: h.portfolio,
          sector: h.sector,
          assetType: h.asset_type,
          lastUpdated: h.last_updated,
        };
      });
      setHoldings(processedHoldings);
    } catch (error) {
      console.error('Error fetching holdings:', error);
    }
  };

  useEffect(() => {
    fetchHoldings();
    // Fetch other data like transactions, members, etc. in a similar way
  }, []);

  const addHolding = async (holding: Omit<Holding, 'id' | 'marketValue' | 'unrealizedGain' | 'unrealizedGainLoss' | 'unrealizedGainPercent' | 'lastUpdated'>) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE_URL}/investment/holdings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(holding),
      });
      fetchHoldings(); // Refetch holdings after adding a new one
    } catch (error) {
      console.error('Error adding holding:', error);
    }
  };

  const performanceHistory: PerformanceDataPoint[] = [
    { date: '2024-01-01', nav: 100.00, benchmark: 100.00, portfolioValue: 25000, cashValue: 5000 },
    { date: '2024-01-15', nav: 102.50, benchmark: 101.20, portfolioValue: 25625, cashValue: 4800 },
    { date: '2024-02-01', nav: 105.20, benchmark: 103.80, portfolioValue: 26300, cashValue: 4600 },
    { date: '2024-02-15', nav: 108.75, benchmark: 106.50, portfolioValue: 27187, cashValue: 4400 },
    { date: '2024-03-01', nav: 112.30, benchmark: 109.20, portfolioValue: 28075, cashValue: 4200 },
    { date: '2024-03-15', nav: 115.80, benchmark: 112.10, portfolioValue: 28950, cashValue: 4000 }
  ];

  const dashboardStats: DashboardStats = useMemo(() => {
    const totalValue = Object.values(portfolios).reduce((sum, p) => sum + p.totalValue, 0);
    const totalGainLoss = Object.values(portfolios).reduce((sum, p) => sum + p.totalGainLoss, 0);
    const totalInvested = Object.values(portfolios).reduce((sum, p) => 
      sum + p.holdings.reduce((holdingSum, h) => holdingSum + (h.avgPrice * h.quantity), 0), 0
    );
    
    return {
      totalValue,
      totalGainLoss,
      totalGainLossPercent: totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0,
      monthlyReturn: 2.45,
      yearlyReturn: 15.80,
      totalMembers: members.length,
      activeMembers: members.filter(m => m.status === MemberStatus.ACTIVE).length,
      totalTransactions: transactions.length
    };
  }, [portfolios, members, transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  return {
    transactions,
    members,
    holdings,
    portfolios,
    performanceHistory,
    dashboardStats,
    cash: Object.values(portfolios).reduce((sum, p) => sum + p.cash, 0),
    totalValue: dashboardStats.totalValue,
    shareValue: 10.75,
    totalShares: members.reduce((sum, m) => sum + m.shares, 0),
    addTransaction,
    addHolding,
  };
};