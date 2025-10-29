import { useState, useMemo } from 'react';
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

export const useClubData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: TransactionType.DEPOSIT,
      date: '2024-01-15',
      portfolio: PortfolioType.PHRONESIS,
      amount: 5000,
      memberId: '1',
      description: 'Dépôt initial'
    },
    {
      id: '2',
      type: TransactionType.BUY,
      date: '2024-01-16',
      portfolio: PortfolioType.PHRONESIS,
      amount: 2500,
      asset: 'AAPL',
      quantity: 15,
      price: 166.67,
      description: 'Achat Apple Inc.'
    },
    {
      id: '3',
      type: TransactionType.BUY,
      date: '2024-01-20',
      portfolio: PortfolioType.FLAGSHIP,
      amount: 3000,
      asset: 'MSFT',
      quantity: 8,
      price: 375.00,
      description: 'Achat Microsoft Corp.'
    },
    {
      id: '4',
      type: TransactionType.DIVIDEND,
      date: '2024-02-01',
      portfolio: PortfolioType.PHRONESIS,
      amount: 45.20,
      asset: 'AAPL',
      description: 'Dividende trimestriel Apple'
    }
  ]);

  const [members] = useState<Member[]>([
    {
      id: '1',
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      phone: '+33 6 12 34 56 78',
      joinDate: '2024-01-01',
      totalContribution: 15000,
      currentBalance: 16250,
      investedCapital: 15000,
      shares: 150,
      status: MemberStatus.ACTIVE,
      profileType: 'Premium',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Marie Martin',
      email: 'marie.martin@email.com',
      phone: '+33 6 98 76 54 32',
      joinDate: '2024-01-01',
      totalContribution: 12000,
      currentBalance: 13100,
      investedCapital: 12000,
      shares: 120,
      status: MemberStatus.ACTIVE,
      profileType: 'Standard',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '3',
      name: 'Pierre Durand',
      email: 'pierre.durand@email.com',
      phone: '+33 6 11 22 33 44',
      joinDate: '2024-02-01',
      totalContribution: 8000,
      currentBalance: 8420,
      investedCapital: 8000,
      shares: 80,
      status: MemberStatus.ACTIVE,
      profileType: 'Standard'
    }
  ]);

  const holdings: Holding[] = [
    {
      id: '1',
      asset: 'AAPL',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 15,
      avgPrice: 166.67,
      averageCost: 166.67,
      currentPrice: 185.50,
      marketValue: 2782.50,
      unrealizedGain: 282.45,
      unrealizedGainLoss: 282.45,
      unrealizedGainPercent: 11.29,
      portfolio: PortfolioType.PHRONESIS,
      sector: 'Technology',
      assetType: 'stock',
      lastUpdated: '2024-03-15T10:30:00Z'
    },
    {
      id: '2',
      asset: 'MSFT',
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      quantity: 8,
      avgPrice: 375.00,
      averageCost: 375.00,
      currentPrice: 420.75,
      marketValue: 3366.00,
      unrealizedGain: 366.00,
      unrealizedGainLoss: 366.00,
      unrealizedGainPercent: 12.20,
      portfolio: PortfolioType.FLAGSHIP,
      sector: 'Technology',
      assetType: 'stock',
      lastUpdated: '2024-03-15T10:30:00Z'
    },
    {
      id: '3',
      asset: 'GOOGL',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      quantity: 5,
      avgPrice: 140.00,
      averageCost: 140.00,
      currentPrice: 152.30,
      marketValue: 761.50,
      unrealizedGain: 61.50,
      unrealizedGainLoss: 61.50,
      unrealizedGainPercent: 8.79,
      portfolio: PortfolioType.PHRONESIS,
      sector: 'Technology',
      assetType: 'stock',
      lastUpdated: '2024-03-15T10:30:00Z'
    }
  ];

  const portfolios: { [key in PortfolioType]: Portfolio } = useMemo(() => ({
    [PortfolioType.PHRONESIS]: {
      id: 'phronesis',
      name: 'Phronesis (Passif)',
      type: PortfolioType.PHRONESIS,
      holdings: holdings.filter(h => h.portfolio === PortfolioType.PHRONESIS),
      cash: 12500,
      totalValue: 16044.00,
      totalGainLoss: 344.00,
      totalGainLossPercent: 2.19,
      lastUpdated: '2024-03-15T10:30:00Z'
    },
    [PortfolioType.FLAGSHIP]: {
      id: 'flagship',
      name: 'FlagShip (Actif)',
      type: PortfolioType.FLAGSHIP,
      holdings: holdings.filter(h => h.portfolio === PortfolioType.FLAGSHIP),
      cash: 8200,
      totalValue: 11566.00,
      totalGainLoss: 366.00,
      totalGainLossPercent: 3.27,
      lastUpdated: '2024-03-15T10:30:00Z'
    }
  }), []);

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
  };
};