import React, { useState } from 'react';

const Transactions: React.FC = () => {
  const [formData, setFormData] = useState({
    portfolio: 'Phronesis (Passive)',
    type: 'DEPOSIT',
    member: 'Select Member',
    amount: '',
    date: '17/09/2025'
  });

  const transactionsData = [
    {
      date: '2023-12-31',
      type: 'WITHDRAWAL',
      portfolio: 'FlagShip',
      details: 'Charlie Brown',
      amount: '$5,500.00'
    },
    {
      date: '2023-06-01',
      type: 'SELL',
      portfolio: 'FlagShip',
      details: 'XAU/USD (1 @ 1950)',
      amount: '$1,950.00'
    },
    {
      date: '2023-05-15',
      type: 'BUY',
      portfolio: 'FlagShip',
      details: 'XAU/USD (2 @ 1900)',
      amount: '$3,800.00'
    },
    {
      date: '2023-03-10',
      type: 'BUY',
      portfolio: 'Phronesis',
      details: 'GOOGL (10 @ 100)',
      amount: '$1,000.00'
    },
    {
      date: '2022-08-01',
      type: 'BUY',
      portfolio: 'Phronesis',
      details: 'AAPL (30 @ 150)',
      amount: '$4,500.00'
    },
    {
      date: '2022-06-01',
      type: 'DEPOSIT',
      portfolio: 'FlagShip',
      details: 'Charlie Brown',
      amount: '$5,000.00'
    },
    {
      date: '2019-07-20',
      type: 'DEPOSIT',
      portfolio: 'Phronesis',
      details: 'Alice Johnson',
      amount: '$10,000.00'
    },
    {
      date: '2019-07-20',
      type: 'DEPOSIT',
      portfolio: 'Phronesis',
      details: 'Bob Williams',
      amount: '$15,000.00'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BUY':
        return 'bg-blue-600 text-white';
      case 'SELL':
        return 'bg-orange-600 text-white';
      case 'DEPOSIT':
        return 'bg-green-600 text-white';
      case 'WITHDRAWAL':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getPortfolioColor = (portfolio: string) => {
    return portfolio === 'Phronesis' ? 'bg-blue-600 text-white' : 'bg-teal-600 text-white';
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Transaction Form */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Add Transaction</h2>
          
          <div className="space-y-4">
            {/* Portfolio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Portfolio
              </label>
              <select 
                value={formData.portfolio}
                onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded border border-gray-600 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Phronesis (Passive)</option>
                <option>FlagShip (Active)</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded border border-gray-600 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>DEPOSIT</option>
                <option>WITHDRAWAL</option>
                <option>BUY</option>
                <option>SELL</option>
              </select>
            </div>

            {/* Member */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Member
              </label>
              <select 
                value={formData.member}
                onChange={(e) => setFormData({...formData, member: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded border border-gray-600 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Select Member</option>
                <option>Alice Johnson</option>
                <option>Bob Williams</option>
                <option>Charlie Brown</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount
              </label>
              <input 
                type="text"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded border border-gray-600 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input 
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded border border-gray-600 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
              Add Transaction
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h2>
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors">
              Export to CSV
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    DATE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    TYPE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    PORTFOLIO
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    DETAILS
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    AMOUNT
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {transactionsData.map((transaction, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                      {transaction.date}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getTypeColor(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getPortfolioColor(transaction.portfolio)}`}>
                        {transaction.portfolio}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                      {transaction.details}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-300 text-right">
                      {transaction.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;