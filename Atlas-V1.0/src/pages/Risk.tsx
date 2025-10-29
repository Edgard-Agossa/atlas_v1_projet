import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
    <div className="p-6 space-y-6">
      {/* Portfolio Tabs */}
      <div className="flex space-x-2">
        {['Combined', 'Phronesis', 'FlagShip'].map((tab) => (
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

      {/* Portfolio Concentration */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Portfolio Concentration ({activeTab.toUpperCase()})
        </h2>
        
        <div className="space-y-4">
          {currentData.concentration.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
              <div className="flex items-center space-x-4 flex-1 ml-6">
                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 w-12 text-right">
                  {item.value}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Asset Allocation */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Asset Allocation ({activeTab.toUpperCase()})
        </h2>
        
        <div className="flex justify-center mb-6">
          <ResponsiveContainer width={300} height={300}>
            <PieChart>
              <Pie
                data={currentData.allocation}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="value"
              >
                {currentData.allocation.map((entry, index) => (
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
                formatter={(value) => [`${value}%`, 'Allocation']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-center space-x-6 text-sm">
          {currentData.allocation.map((item, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Qualitative Risk Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          AI Qualitative Risk Summary ({activeTab.toUpperCase()})
        </h2>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Generate a qualitative risk summary for the selected portfolio based on concentration and market factors.
        </p>
        
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors">
          Generate AI Summary
        </button>
      </div>
    </div>
  );
};

export default Risk;