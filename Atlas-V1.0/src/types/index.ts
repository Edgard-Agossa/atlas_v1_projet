export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  BUY = 'BUY',
  SELL = 'SELL',
  DIVIDEND = 'DIVIDEND',
}

export enum PortfolioType {
  PHRONESIS = 'PHRONESIS',
  FLAGSHIP = 'FLAGSHIP',
}

export enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  portfolio: PortfolioType;
  amount: number;
  memberId?: string;
  asset?: string;
  quantity?: number;
  price?: number;
  description?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joinDate: string;
  exitDate?: string;
  totalContribution: number;
  currentBalance: number;
  investedCapital: number;
  shares: number;
  status: MemberStatus;
  profileType: string;
  avatar?: string;
}

export interface Holding {
  id: string;
  asset: string;
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedGain: number;
  unrealizedGainLoss: number;
  unrealizedGainPercent: number;
  portfolio: PortfolioType;
  sector?: string;
  assetType: 'stock' | 'etf' | 'bond' | 'reit' | 'crypto';
  lastUpdated: string;
}

export interface Portfolio {
  id: string;
  name: string;
  type: PortfolioType;
  holdings: Holding[];
  cash: number;
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  lastUpdated: string;
  owner?: string;
}

export interface PerformanceDataPoint {
  date: string;
  nav: number;
  benchmark: number;
  portfolioValue: number;
  cashValue: number;
}

export interface AssetDetails {
  name: string;
  value: number;
  ticker?: string;
  sector?: string;
  geography?: string;
  assetType?: string;
  weight?: number;
}

export interface DashboardStats {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  monthlyReturn: number;
  yearlyReturn: number;
  totalMembers: number;
  activeMembers: number;
  totalTransactions: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}