import React, { useState } from 'react';

const ETFs: React.FC = () => {
  const [etfTicker, setEtfTicker] = useState('SPY');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const handleGenerateAnalysis = () => {
    const etfData = getETFData(etfTicker);
    
    const result = `ETF Analysis for ${etfTicker}:

Strategy: ${etfData.strategy}
Holdings: ${etfData.holdings}
Performance: ${etfData.performance}

Key Metrics:
• Expense Ratio: ${etfData.expenseRatio}%
• Assets Under Management: $${etfData.aum}B
• Average Daily Volume: ${etfData.volume}M shares
• Dividend Yield: ${etfData.dividendYield}%

Top Holdings:
${etfData.topHoldings.map((holding: string, index: number) => `${index + 1}. ${holding}`).join('\n')}

Risk Assessment: ${etfData.riskLevel}
Recommendation: ${etfData.recommendation}`;

    setAnalysisResult(result);
  };

  const getETFData = (ticker: string) => {
    const etfDatabase: { [key: string]: any } = {
      'SPY': {
        strategy: 'Tracks the S&P 500 Index',
        holdings: '500+ large-cap US stocks',
        performance: 'Strong long-term performance with low tracking error',
        expenseRatio: 0.09,
        aum: 450,
        volume: 75,
        dividendYield: 1.3,
        topHoldings: ['Apple Inc. (7.1%)', 'Microsoft Corp. (6.8%)', 'Amazon.com Inc. (3.4%)', 'NVIDIA Corp. (2.9%)', 'Alphabet Inc. (2.1%)'],
        riskLevel: 'Moderate - Market risk exposure',
        recommendation: 'Suitable for core portfolio allocation'
      },
      'QQQ': {
        strategy: 'Tracks the NASDAQ-100 Index',
        holdings: '100 largest non-financial NASDAQ stocks',
        performance: 'High growth potential with technology focus',
        expenseRatio: 0.20,
        aum: 200,
        volume: 45,
        dividendYield: 0.6,
        topHoldings: ['Apple Inc. (12.1%)', 'Microsoft Corp. (10.8%)', 'Amazon.com Inc. (6.4%)', 'NVIDIA Corp. (5.9%)', 'Tesla Inc. (4.1%)'],
        riskLevel: 'High - Technology sector concentration',
        recommendation: 'Growth-oriented investors with higher risk tolerance'
      }
    };

    return etfDatabase[ticker] || {
      strategy: 'Diversified investment strategy',
      holdings: 'Various securities across sectors',
      performance: 'Performance varies based on underlying assets',
      expenseRatio: 0.50,
      aum: 10,
      volume: 5,
      dividendYield: 2.0,
      topHoldings: ['Holding 1', 'Holding 2', 'Holding 3', 'Holding 4', 'Holding 5'],
      riskLevel: 'Moderate',
      recommendation: 'Consult detailed prospectus for specific information'
    };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-xl font-semibold text-gray-300">AI-Powered ETF Analysis</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ETF Profile */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ETF Profile
          </h2>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Get a comprehensive overview of any ETF, including its strategy, holdings, and performance.
          </p>
          
          <div className="space-y-4">
            {/* ETF Ticker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ETF Ticker
              </label>
              <input 
                type="text"
                value={etfTicker}
                onChange={(e) => setEtfTicker(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded border border-gray-600 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter ETF ticker"
              />
            </div>

            {/* Generate Analysis Button */}
            <button 
              onClick={handleGenerateAnalysis}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Generate Analysis
            </button>
          </div>
        </div>

        {/* Analysis Results */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          {!analysisResult ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter an ETF ticker and click "Generate Analysis" to see the results.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  ETF Analysis Results
                </h3>
                <pre className="text-sm text-blue-700 dark:text-blue-400 whitespace-pre-wrap font-mono">
                  {analysisResult}
                </pre>
              </div>

              <button 
                onClick={() => setAnalysisResult(null)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Clear Analysis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ETFs;