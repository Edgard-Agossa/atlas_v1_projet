import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const TrackRecord: React.FC = () => {
  const performanceData = [
    { date: 'Jan 21', portfolio: 30, benchmark: 20 },
    { date: 'Jun 21', portfolio: 35, benchmark: 25 },
    { date: 'Nov 21', portfolio: 32, benchmark: 28 },
    { date: 'Apr 22', portfolio: 38, benchmark: 30 },
    { date: 'Sep 22', portfolio: 42, benchmark: 32 },
    { date: 'Feb 23', portfolio: 40, benchmark: 35 },
    { date: 'Jul 23', portfolio: 45, benchmark: 38 },
    { date: 'Dec 23', portfolio: 48, benchmark: 40 },
    { date: 'May 24', portfolio: 52, benchmark: 42 },
    { date: 'Oct 24', portfolio: 55, benchmark: 45 },
    { date: 'Mar 25', portfolio: 58, benchmark: 47 },
    { date: 'Aug 25', portfolio: 60, benchmark: 50 }
  ];

  const drawdownData = [
    { date: 'Jan 21', drawdown: 0 },
    { date: 'Jun 21', drawdown: -2 },
    { date: 'Nov 21', drawdown: -5 },
    { date: 'Apr 22', drawdown: -3 },
    { date: 'Sep 22', drawdown: -1 },
    { date: 'Feb 23', drawdown: -4 },
    { date: 'Jul 23', drawdown: -2 },
    { date: 'Dec 23', drawdown: -6 },
    { date: 'May 24', drawdown: -3 },
    { date: 'Oct 24', drawdown: -8 },
    { date: 'Mar 25', drawdown: -5 },
    { date: 'Aug 25', drawdown: -2 }
  ];

  const annualReturns = [
    { year: 2025, portfolioReturn: 10.82, benchmarkReturn: 4.39 },
    { year: 2024, portfolioReturn: 18.58, benchmarkReturn: 7.57 },
    { year: 2023, portfolioReturn: -1.44, benchmarkReturn: -3.87 },
    { year: 2022, portfolioReturn: -9.66, benchmarkReturn: 6.65 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Track Record</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors">
          Export to CSV
        </button>
      </div>

      {/* Key Performance Indicators */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Key Performance Indicators</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cumulative Return</p>
            <p className="text-2xl font-bold text-green-500">37.54%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Annualized Return</p>
            <p className="text-2xl font-bold text-green-500">6.58%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Annualized Volatility</p>
            <p className="text-2xl font-bold text-blue-500">10.61%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sharpe Ratio</p>
            <p className="text-2xl font-bold text-blue-500">0.43</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Max Drawdown</p>
            <p className="text-2xl font-bold text-red-500">-14.94%</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance vs Benchmark */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance vs. Benchmark (S&P 500)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
              />
              <YAxis 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                tickFormatter={(value) => `$${value}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#f3f4f6'
                }}
                formatter={(value, name) => [`$${value}k`, name === 'portfolio' ? 'Portfolio' : 'Benchmark']}
              />
              <Line 
                type="monotone" 
                dataKey="portfolio" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="benchmark" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-blue-600 dark:text-blue-400">Portfolio</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-green-600 dark:text-green-400">Benchmark</span>
            </div>
          </div>
        </div>

        {/* Drawdown History */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Drawdown History</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={drawdownData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
              />
              <YAxis 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                tickFormatter={(value) => `${value}%`}
                domain={[-16, 0]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#f3f4f6'
                }}
                formatter={(value) => [`${value}%`, 'Drawdown']}
              />
              <Area 
                type="monotone" 
                dataKey="drawdown" 
                stroke="#ef4444" 
                fill="#ef4444"
                fillOpacity={0.6}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Annual Returns Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Annual Returns</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  YEAR
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  PORTFOLIO RETURN
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  BENCHMARK RETURN
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {annualReturns.map((row) => (
                <tr key={row.year} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-300">
                    {row.year}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-medium ${
                      row.portfolioReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {row.portfolioReturn >= 0 ? '+' : ''}{row.portfolioReturn.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-medium ${
                      row.benchmarkReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {row.benchmarkReturn >= 0 ? '+' : ''}{row.benchmarkReturn.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrackRecord;