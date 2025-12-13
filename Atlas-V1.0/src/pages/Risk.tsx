import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Shield, TrendingDown, AlertTriangle, BarChart3 } from 'lucide-react';

const Risk: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Combined');

  const portfolioData = {
    Combined: {
      concentration: [
        { name: 'Top Holding', value: 20.44 },
        { name: 'Top 3 Holdings', value: 33.22 },
        { name: 'Top 5 Holdings', value: 33.22 }
      ],
      allocation: [
        { name: 'Stocks', value: 60, color: '#1e40af' },
        { name: 'Cash', value: 25, color: '#3b82f6' },
        { name: 'GOOGL', value: 10, color: '#60a5fa' },
        { name: 'XAU/USD', value: 5, color: '#93c5fd' }
      ]
    },
    Phronesis: {
      concentration: [
        { name: 'Top Holding', value: 25.50 },
        { name: 'Top 3 Holdings', value: 45.80 },
        { name: 'Top 5 Holdings', value: 65.20 }
      ],
      allocation: [
        { name: 'Stocks', value: 70, color: '#1e40af' },
        { name: 'Cash', value: 20, color: '#3b82f6' },
        { name: 'ETFs', value: 10, color: '#60a5fa' }
      ]
    },
    FlagShip: {
      concentration: [
        { name: 'Top Holding', value: 35.75 },
        { name: 'Top 3 Holdings', value: 55.60 },
        { name: 'Top 5 Holdings', value: 78.90 }
      ],
      allocation: [
        { name: 'XAU/USD', value: 50, color: '#1e40af' },
        { name: 'Currency Pairs', value: 30, color: '#3b82f6' },
        { name: 'Cash', value: 20, color: '#60a5fa' }
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
        <div className="flex items-center space-x-3 mb-2">
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
              Risk Analysis
            </motion.h1>
            <motion.p 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-gray-600 dark:text-gray-400"
            >
              Analyse complète des risques de portefeuille
            </motion.p>
          </div>
        </div>

        {/* Portfolio Tabs */}
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

      {/* Risk Metrics Cards */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {[
          { label: 'VaR (95%)', value: '€12,450', change: '-2.3%', icon: TrendingDown },
          { label: 'Sharpe Ratio', value: '1.24', change: '+0.15', icon: BarChart3 },
          { label: 'Beta', value: '0.87', change: '-0.05', icon: TrendingDown },
          { label: 'Max Drawdown', value: '8.2%', change: '+1.1%', icon: AlertTriangle }
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
              <metric.icon className="w-5 h-5 text-gray-500" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Concentration */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.65 }}
          whileHover={{ scale: 1.02, y: -3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
            <motion.h3 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
              className="text-lg font-bold text-gray-900 dark:text-white"
            >
              Concentration
            </motion.h3>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full">
              {activeTab.toUpperCase()}
            </span>
          </div>
          
          <div className="space-y-4">
            {currentData.concentration.map((item, index) => (
              <motion.div 
                key={index} 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.75 + index * 0.05 }}
                className="group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {item.value}%
                  </span>
                </div>
                <div className="relative">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 0.6, delay: 0.8 + index * 0.05, ease: "easeOut" }}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full shadow-sm"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Asset Allocation */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          whileHover={{ scale: 1.02, y: -3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <motion.h3 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.75 }}
              className="text-lg font-bold text-gray-900 dark:text-white"
            >
              Allocation
            </motion.h3>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full">
              {activeTab.toUpperCase()}
            </span>
          </div>
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex justify-center mb-6"
          >
            <ResponsiveContainer width={280} height={280}>
              <PieChart>
                <Pie
                  data={currentData.allocation}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  dataKey="value"
                  strokeWidth={3}
                  stroke="#ffffff"
                >
                  {currentData.allocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: '#f3f4f6',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                  }}
                  formatter={(value) => [`${value}%`, 'Allocation']}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-4">
            {currentData.allocation.map((item, index) => (
              <motion.div 
                key={index} 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.9 + index * 0.03 }}
                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div 
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.value}%</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Risk Score */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.75 }}
          whileHover={{ scale: 1.02, y: -3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Risk Score</h3>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">7.2</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">Risque Modéré</div>
            
            <div className="space-y-3">
              {[
                { label: 'Volatilité', value: 85 },
                { label: 'Liquidité', value: 92 },
                { label: 'Diversification', value: 78 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                      />
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium w-8">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Risk Summary */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.8 }}
        whileHover={{ scale: 1.01, y: -2 }}
        className="mt-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <motion.h2 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.85 }}
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              AI Risk Analysis
            </motion.h2>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full">
              {activeTab.toUpperCase()}
            </span>
          </div>
        </div>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.9 }}
          className="text-gray-600 dark:text-gray-400 mb-4 text-sm"
        >
          Analyse IA des risques basée sur la concentration, volatilité et corrélations de marché.
        </motion.p>
        
        <motion.button 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.95 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Analyser les Risques</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Risk;