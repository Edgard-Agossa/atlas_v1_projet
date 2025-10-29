import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import WelcomeMessage from '../components/WelcomeMessage';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Global');

  const portfolioData = {
    Global: {
      stats: {
        totalValue: '$25,680.00',
        phronesisNav: '$26,050.00',
        flagshipNav: '-$370.00',
        valuePerShare: '$102.72',
        performance: '-1.32%',
        performanceDetails: 'Underperforming by 6.89%',
        benchmark: 'Benchmark: 5.57%',
        cashBalance: '$17,150.00',
        cashDetails: ['Phronesis: $14,500.00', 'FlagShip: $2,650.00']
      },
      performanceData: [
        { date: 'Dec 20', clubNav: 50, benchmark: 50 },
        { date: 'Apr 21', clubNav: 75, benchmark: 60 },
        { date: 'Aug 21', clubNav: 90, benchmark: 70 },
        { date: 'Dec 21', clubNav: 85, benchmark: 75 },
        { date: 'Apr 22', clubNav: 110, benchmark: 85 },
        { date: 'Aug 22', clubNav: 120, benchmark: 90 },
        { date: 'Dec 22', clubNav: 115, benchmark: 95 },
        { date: 'Apr 23', clubNav: 140, benchmark: 105 },
        { date: 'Aug 23', clubNav: 150, benchmark: 110 },
        { date: 'Dec 23', clubNav: 145, benchmark: 115 },
        { date: 'Apr 24', clubNav: 170, benchmark: 125 },
        { date: 'Aug 24', clubNav: 180, benchmark: 130 },
        { date: 'Dec 24', clubNav: 175, benchmark: 135 },
        { date: 'Apr 25', clubNav: 200, benchmark: 145 },
        { date: 'Aug 25', clubNav: 210, benchmark: 150 }
      ]
    },
    'Phronesis Portfolio': {
      stats: {
        totalValue: '$26,050.00',
        phronesisNav: '$26,050.00',
        flagshipNav: '$0.00',
        valuePerShare: '$104.20',
        performance: '+2.15%',
        performanceDetails: 'Outperforming by 3.42%',
        benchmark: 'Benchmark: 5.57%',
        cashBalance: '$14,500.00',
        cashDetails: ['Available: $14,500.00']
      },
      performanceData: [
        { date: 'Dec 20', clubNav: 55, benchmark: 50 },
        { date: 'Apr 21', clubNav: 80, benchmark: 60 },
        { date: 'Aug 21', clubNav: 95, benchmark: 70 },
        { date: 'Dec 21', clubNav: 90, benchmark: 75 },
        { date: 'Apr 22', clubNav: 115, benchmark: 85 },
        { date: 'Aug 22', clubNav: 125, benchmark: 90 },
        { date: 'Dec 22', clubNav: 120, benchmark: 95 },
        { date: 'Apr 23', clubNav: 145, benchmark: 105 },
        { date: 'Aug 23', clubNav: 155, benchmark: 110 },
        { date: 'Dec 23', clubNav: 150, benchmark: 115 },
        { date: 'Apr 24', clubNav: 175, benchmark: 125 },
        { date: 'Aug 24', clubNav: 185, benchmark: 130 },
        { date: 'Dec 24', clubNav: 180, benchmark: 135 },
        { date: 'Apr 25', clubNav: 205, benchmark: 145 },
        { date: 'Aug 25', clubNav: 215, benchmark: 150 }
      ]
    },
    'FlagShip Portfolio': {
      stats: {
        totalValue: '-$370.00',
        phronesisNav: '$0.00',
        flagshipNav: '-$370.00',
        valuePerShare: '$98.52',
        performance: '-8.75%',
        performanceDetails: 'Underperforming by 14.32%',
        benchmark: 'Benchmark: 5.57%',
        cashBalance: '$2,650.00',
        cashDetails: ['Available: $2,650.00']
      },
      performanceData: [
        { date: 'Dec 20', clubNav: 45, benchmark: 50 },
        { date: 'Apr 21', clubNav: 65, benchmark: 60 },
        { date: 'Aug 21', clubNav: 75, benchmark: 70 },
        { date: 'Dec 21', clubNav: 70, benchmark: 75 },
        { date: 'Apr 22', clubNav: 85, benchmark: 85 },
        { date: 'Aug 22', clubNav: 95, benchmark: 90 },
        { date: 'Dec 22', clubNav: 90, benchmark: 95 },
        { date: 'Apr 23', clubNav: 105, benchmark: 105 },
        { date: 'Aug 23', clubNav: 115, benchmark: 110 },
        { date: 'Dec 23', clubNav: 110, benchmark: 115 },
        { date: 'Apr 24', clubNav: 125, benchmark: 125 },
        { date: 'Aug 24', clubNav: 135, benchmark: 130 },
        { date: 'Dec 24', clubNav: 130, benchmark: 135 },
        { date: 'Apr 25', clubNav: 145, benchmark: 145 },
        { date: 'Aug 25', clubNav: 155, benchmark: 150 }
      ]
    }
  };

  const portfolioSplitData = [
    { name: 'Phronesis', value: 85, color: '#3b82f6' },
    { name: 'Other', value: 15, color: '#1e293b' }
  ];

  const assetAllocationData = [
    { name: 'Stocks', value: 60, color: '#3b82f6' },
    { name: 'Cash', value: 25, color: '#60a5fa' },
    { name: 'Bonds', value: 10, color: '#93c5fd' },
    { name: 'Other', value: 5, color: '#dbeafe' }
  ];

  const currentData = portfolioData[activeTab as keyof typeof portfolioData];

  return (
    <div className="p-6 space-y-6">
      <WelcomeMessage />
      {/* Portfolio Tabs */}
      <div className="flex space-x-2">
        {['Global', 'Phronesis Portfolio', 'FlagShip Portfolio'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 dark:bg-slate-700 text-gray-300 hover:bg-slate-600 dark:hover:bg-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Club Value */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Club Value (NAV)</h3>
          <p className="text-blue-600 dark:text-blue-400 text-2xl font-bold">{currentData.stats.totalValue}</p>
        </div>

        {/* Phronesis Portfolio NAV */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Phronesis Portfolio NAV</h3>
          <p className="text-blue-600 dark:text-blue-400 text-2xl font-bold">{currentData.stats.phronesisNav}</p>
        </div>

        {/* FlagShip Portfolio NAV */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">FlagShip Portfolio NAV</h3>
          <p className={`text-2xl font-bold ${
            currentData.stats.flagshipNav.includes('-') ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
          }`}>{currentData.stats.flagshipNav}</p>
        </div>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Value Per Share */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Value Per Share</h3>
          <p className="text-blue-600 dark:text-blue-400 text-2xl font-bold">{currentData.stats.valuePerShare}</p>
        </div>

        {/* Overall Performance */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Overall Performance</h3>
          <p className={`text-2xl font-bold ${
            currentData.stats.performance.includes('-') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
          }`}>{currentData.stats.performance}</p>
          <p className={`text-xs ${
            currentData.stats.performance.includes('-') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
          }`}>{currentData.stats.performanceDetails}</p>
          <p className="text-gray-500 dark:text-gray-500 text-xs">{currentData.stats.benchmark}</p>
        </div>

        {/* Cash Balance */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Cash Balance (Total)</h3>
          <p className="text-blue-600 dark:text-blue-400 text-2xl font-bold">{currentData.stats.cashBalance}</p>
          {currentData.stats.cashDetails.map((detail, index) => (
            <p key={index} className="text-gray-500 dark:text-gray-500 text-xs">{detail}</p>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-gray-900 dark:text-gray-300 text-lg font-semibold mb-4">{activeTab} Performance vs. Benchmark (S&P 500)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentData.performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
              />
              <YAxis 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#f3f4f6'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="clubNav" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                name="Club NAV"
              />
              <Line 
                type="monotone" 
                dataKey="benchmark" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                name="Benchmark"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-blue-600 dark:text-blue-400">Club NAV</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-green-600 dark:text-green-400">Benchmark</span>
            </div>
          </div>
        </div>

        {/* Right Column Charts */}
        <div className="space-y-6">
          {/* Portfolio Split */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
            <h3 className="text-gray-900 dark:text-gray-300 text-lg font-semibold mb-4">Portfolio Split</h3>
            <div className="flex justify-center">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={portfolioSplitData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {portfolioSplitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: '#f3f4f6'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-2">
              <span className="text-blue-600 dark:text-blue-400 text-sm">■ Phronesis</span>
            </div>
          </div>

          {/* Combined Asset Allocation */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
            <h3 className="text-gray-900 dark:text-gray-300 text-lg font-semibold mb-4">Combined Asset Allocation</h3>
            <div className="flex justify-center">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={assetAllocationData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {assetAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: '#f3f4f6'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-2 text-sm">
              <span className="text-blue-600 dark:text-blue-600">■ Stocks</span>
              <span className="text-blue-400 dark:text-blue-400">■ Cash</span>
              <span className="text-blue-300 dark:text-blue-300">■ Bonds</span>
              <span className="text-blue-200 dark:text-blue-200">■ Active Windows</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;