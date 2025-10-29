import React, { useState } from 'react';

const StressTest: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Combined');
  const [scenario, setScenario] = useState('Market Downturn');
  const [percentageChange, setPercentageChange] = useState('-20');
  const [testResults, setTestResults] = useState<string | null>(null);

  const scenarios = [
    'Market Downturn',
    'Interest Rate Shock',
    'Currency Crisis',
    'Inflation Spike',
    'Recession Scenario',
    'Black Swan Event'
  ];

  const handleRunTest = () => {
    // Simulate test results based on scenario and percentage
    const impact = Math.abs(parseFloat(percentageChange));
    let resultMessage = '';

    switch (scenario) {
      case 'Market Downturn':
        resultMessage = `Portfolio would lose approximately ${(impact * 0.8).toFixed(1)}% in a ${impact}% market downturn. High-risk assets would be most affected.`;
        break;
      case 'Interest Rate Shock':
        resultMessage = `Portfolio would decline by ${(impact * 0.6).toFixed(1)}% with a ${impact}% interest rate change. Bond positions would be significantly impacted.`;
        break;
      case 'Currency Crisis':
        resultMessage = `Portfolio would experience a ${(impact * 0.4).toFixed(1)}% loss due to currency exposure in a ${impact}% currency devaluation scenario.`;
        break;
      case 'Inflation Spike':
        resultMessage = `Portfolio would lose ${(impact * 0.5).toFixed(1)}% real value in a ${impact}% inflation scenario. Commodities may provide some protection.`;
        break;
      case 'Recession Scenario':
        resultMessage = `Portfolio would decline by ${(impact * 0.9).toFixed(1)}% in a severe recession with ${impact}% economic contraction.`;
        break;
      case 'Black Swan Event':
        resultMessage = `Portfolio could lose up to ${(impact * 1.2).toFixed(1)}% in an extreme ${impact}% market shock. Diversification benefits may be limited.`;
        break;
      default:
        resultMessage = `Test completed for ${scenario} with ${percentageChange}% change.`;
    }

    setTestResults(resultMessage);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-xl font-semibold text-gray-300">Portfolio Stress Test</h1>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Parameters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Test Parameters for {activeTab.toUpperCase()}
          </h2>
          
          <div className="space-y-4">
            {/* Scenario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Scenario
              </label>
              <select 
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded border border-gray-600 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {scenarios.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Percentage Change */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Percentage Change (%)
              </label>
              <input 
                type="number"
                value={percentageChange}
                onChange={(e) => setPercentageChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded border border-gray-600 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter percentage change"
              />
            </div>

            {/* Run Test Button */}
            <button 
              onClick={handleRunTest}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Run Test
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Test Results
          </h2>
          
          {!testResults ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Run a test to see the potential impact.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Scenario: {scenario}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {testResults}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded">
                  <p className="text-gray-600 dark:text-gray-400">Portfolio</p>
                  <p className="font-medium text-gray-900 dark:text-white">{activeTab}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded">
                  <p className="text-gray-600 dark:text-gray-400">Stress Level</p>
                  <p className="font-medium text-gray-900 dark:text-white">{percentageChange}%</p>
                </div>
              </div>

              <button 
                onClick={() => setTestResults(null)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Clear Results
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StressTest;