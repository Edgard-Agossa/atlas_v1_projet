import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Target, DollarSign } from 'lucide-react';

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Combined');

  const portfolioData = {
    Combined: {
      metrics: {
        totalReturn: '+25.4%',
        totalReturnChange: '+2.8%',
        alpha: '4.6%',
        alphaChange: '+0.3%',
        expenseRatio: '0.65%',
        expenseChange: '-0.05%',
        trackingError: '2.1%',
        trackingChange: '+0.1%'
      },
      performance: [
        { month: 'Jan', portfolio: 8.2, benchmark: 6.1 },
        { month: 'Feb', portfolio: 12.5, benchmark: 8.3 },
        { month: 'Mar', portfolio: 15.8, benchmark: 11.2 },
        { month: 'Apr', portfolio: 18.3, benchmark: 14.7 },
        { month: 'May', portfolio: 22.1, benchmark: 17.9 },
        { month: 'Jun', portfolio: 25.4, benchmark: 20.8 }
      ],
      holdings: [
        { name: 'AAPL', weight: '8.2%', return: '+12.4%', sector: 'Technology' },
        { name: 'MSFT', weight: '7.1%', return: '+15.8%', sector: 'Technology' },
        { name: 'GOOGL', weight: '5.9%', return: '+9.2%', sector: 'Communication' }
      ],
      sector: [
        { name: 'Technology', value: 45 },
        { name: 'Precious Metals', value: 25 },
        { name: 'Communication', value: 15 },
        { name: 'Healthcare', value: 10 },
        { name: 'Finance', value: 5 }
      ],
      geography: [
        { name: 'USA', value: 60 },
        { name: 'Global', value: 25 },
        { name: 'Europe', value: 10 },
        { name: 'Asia', value: 5 }
      ],
      assetType: [
        { name: 'Common Stock', value: 35 },
        { name: 'Currency Pair', value: 25 },
        { name: 'ETF', value: 20 },
        { name: 'Cash', value: 20 }
      ]
    },
    Phronesis: {
      metrics: {
        totalReturn: '+18.7%',
        totalReturnChange: '+1.9%',
        alpha: '3.2%',
        alphaChange: '+0.2%',
        expenseRatio: '0.75%',
        expenseChange: '+0.02%',
        trackingError: '1.8%',
        trackingChange: '-0.1%'
      },
      performance: [
        { month: 'Jan', portfolio: 6.8, benchmark: 6.1 },
        { month: 'Feb', portfolio: 9.2, benchmark: 8.3 },
        { month: 'Mar', portfolio: 12.1, benchmark: 11.2 },
        { month: 'Apr', portfolio: 14.9, benchmark: 14.7 },
        { month: 'May', portfolio: 16.8, benchmark: 17.9 },
        { month: 'Jun', portfolio: 18.7, benchmark: 20.8 }
      ],
      holdings: [
        { name: 'NVDA', weight: '12.1%', return: '+28.5%', sector: 'Technology' },
        { name: 'AAPL', weight: '9.8%', return: '+12.4%', sector: 'Technology' },
        { name: 'JNJ', weight: '6.2%', return: '+8.1%', sector: 'Healthcare' }
      ],
      sector: [
        { name: 'Technology', value: 55 },
        { name: 'Healthcare', value: 20 },
        { name: 'Finance', value: 15 },
        { name: 'Communication', value: 10 }
      ],
      geography: [
        { name: 'USA', value: 70 },
        { name: 'Europe', value: 20 },
        { name: 'Asia', value: 10 }
      ],
      assetType: [
        { name: 'Common Stock', value: 60 },
        { name: 'ETF', value: 25 },
        { name: 'Cash', value: 15 }
      ]
    },
    FlagShip: {
      metrics: {
        totalReturn: '+32.1%',
        totalReturnChange: '+4.2%',
        alpha: '6.8%',
        alphaChange: '+0.7%',
        expenseRatio: '0.45%',
        expenseChange: '-0.08%',
        trackingError: '3.2%',
        trackingChange: '+0.3%'
      },
      performance: [
        { month: 'Jan', portfolio: 11.5, benchmark: 6.1 },
        { month: 'Feb', portfolio: 16.8, benchmark: 8.3 },
        { month: 'Mar', portfolio: 21.2, benchmark: 11.2 },
        { month: 'Apr', portfolio: 25.7, benchmark: 14.7 },
        { month: 'May', portfolio: 29.1, benchmark: 17.9 },
        { month: 'Jun', portfolio: 32.1, benchmark: 20.8 }
      ],
      holdings: [
        { name: 'XAU/USD', weight: '35.2%', return: '+18.9%', sector: 'Precious Metals' },
        { name: 'EUR/USD', weight: '22.1%', return: '+6.7%', sector: 'Currency' },
        { name: 'GLD', weight: '15.8%', return: '+14.2%', sector: 'Commodities' }
      ],
      sector: [
        { name: 'Precious Metals', value: 50 },
        { name: 'Currency', value: 30 },
        { name: 'Commodities', value: 20 }
      ],
      geography: [
        { name: 'Global', value: 60 },
        { name: 'USA', value: 25 },
        { name: 'Europe', value: 15 }
      ],
      assetType: [
        { name: 'Currency Pair', value: 45 },
        { name: 'Precious Metals', value: 35 },
        { name: 'Cash', value: 20 }
      ]
    }
  };



  const currentData = portfolioData[activeTab as keyof typeof portfolioData];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-lg p-1">
            <img src="/PHRONESIS - Bleue.png" alt="Phronesis Capital" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <motion.h1 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-3xl font-bold text-gray-900 dark:text-white"
            >
              Portfolio Analytics
            </motion.h1>
            <motion.p 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-gray-600 dark:text-gray-400"
            >
              Analyse détaillée des performances et allocations
            </motion.p>
          </div>
        </div>
        
        {/* Tabs */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex space-x-2"
        >
          {['Combined', 'Phronesis', 'FlagShip'].map((tab, index) => (
            <motion.button
              key={tab}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/25'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {tab}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Key Metrics Cards */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {[
          { label: 'Total Return', value: currentData.metrics.totalReturn, change: currentData.metrics.totalReturnChange, icon: TrendingUp, color: 'green' },
          { label: 'Alpha', value: currentData.metrics.alpha, change: currentData.metrics.alphaChange, icon: Target, color: 'blue' },
          { label: 'Expense Ratio', value: currentData.metrics.expenseRatio, change: currentData.metrics.expenseChange, icon: DollarSign, color: 'gray' },
          { label: 'Tracking Error', value: currentData.metrics.trackingError, change: currentData.metrics.trackingChange, icon: BarChart3, color: 'orange' }
        ].map((metric, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.45 + index * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <metric.icon className={`w-5 h-5 ${
                metric.color === 'green' ? 'text-green-500' :
                metric.color === 'blue' ? 'text-blue-500' :
                metric.color === 'orange' ? 'text-orange-500' : 'text-gray-500'
              }`} />
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                metric.change.startsWith('+') ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}>
                {metric.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{metric.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{metric.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Performance Chart */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.65 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg mb-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Performance vs Benchmark</h3>
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full">
            YTD
          </span>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={currentData.performance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
            />
            <YAxis 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f3f4f6'
              }}
              formatter={(value) => [`${value}%`, '']}
            />
            <Line 
              type="monotone" 
              dataKey="portfolio" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="Portfolio"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="benchmark" 
              stroke="#6b7280" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Benchmark"
              dot={{ fill: '#6b7280', strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Allocation Charts Grid */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.7 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
      >
        {/* By Sector */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.75 }}
          whileHover={{ scale: 1.02, y: -3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">By Sector</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={currentData.sector} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                axisLine={{ stroke: '#374151' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                axisLine={{ stroke: '#374151' }}
                domain={[0, 60]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#f3f4f6'
                }}
                formatter={(value) => [`${value}%`, 'Allocation']}
              />
              <Bar 
                dataKey="value" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* By Geography */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          whileHover={{ scale: 1.02, y: -3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <PieChartIcon className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">By Geography</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={currentData.geography}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                stroke="#ffffff"
                strokeWidth={2}
              >
                {currentData.geography.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'][index]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#f3f4f6'
                }}
                formatter={(value) => [`${value}%`, 'Allocation']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {currentData.geography.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'][index] }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* By Asset Type */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.85 }}
          whileHover={{ scale: 1.02, y: -3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg">
              <Target className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">By Asset Type</h3>
          </div>
          <div className="space-y-3">
            {currentData.assetType.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.value / 50) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400 w-10 text-right">
                    {item.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Holdings Analysis */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Top Holdings Analysis</h3>
          </div>
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full">
            {activeTab.toUpperCase()}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentData.holdings.map((holding, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.95 + index * 0.05 }}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900 dark:text-white">{holding.name}</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{holding.weight}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{holding.sector}</span>
                <span className="text-green-600 dark:text-green-400 font-medium">{holding.return}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;