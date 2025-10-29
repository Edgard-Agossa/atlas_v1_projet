import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Combined');

  const portfolioData = {
    Combined: {
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-300 mb-4">Detailed Asset Allocation</h2>
        
        {/* Tabs */}
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
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By Sector */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-gray-900 dark:text-gray-300 text-lg font-semibold mb-4">By Sector</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentData.sector} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                domain={[0, 80]}
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
        </div>

        {/* By Geography */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-gray-900 dark:text-gray-300 text-lg font-semibold mb-4">By Geography</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentData.geography} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                domain={[0, 80]}
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
        </div>

        {/* By Asset Type */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-gray-900 dark:text-gray-300 text-lg font-semibold mb-4">By Asset Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentData.assetType} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                domain={[0, 80]}
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
        </div>
      </div>
    </div>
  );
};

export default Analytics;