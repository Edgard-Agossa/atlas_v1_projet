import React, { useState } from 'react';

const REITs: React.FC = () => {
  const [reitTicker, setReitTicker] = useState('O');
  const [ffoPerShare, setFfoPerShare] = useState('3.80');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const handleGenerateAnalysis = () => {
    const ffo = parseFloat(ffoPerShare);
    const reitData = getREITData(reitTicker);
    
    // Calculate key REIT metrics
    const ffoYield = (ffo / reitData.currentPrice) * 100;
    const priceToFFO = reitData.currentPrice / ffo;
    const navPremiumDiscount = ((reitData.currentPrice - reitData.nav) / reitData.nav) * 100;
    
    const result = `REIT Analysis for ${reitTicker}:

Property Type: ${reitData.propertyType}
Geographic Focus: ${reitData.geography}
Portfolio: ${reitData.portfolio}

Key Metrics:
• Current Price: $${reitData.currentPrice}
• FFO Per Share: $${ffo.toFixed(2)}
• FFO Yield: ${ffoYield.toFixed(2)}%
• Price-to-FFO Ratio: ${priceToFFO.toFixed(1)}x
• Dividend Yield: ${reitData.dividendYield}%
• Occupancy Rate: ${reitData.occupancyRate}%

Valuation:
• Net Asset Value (NAV): $${reitData.nav}
• Premium/Discount to NAV: ${navPremiumDiscount > 0 ? '+' : ''}${navPremiumDiscount.toFixed(1)}%

Financial Health:
• Debt-to-Equity Ratio: ${reitData.debtToEquity}
• Interest Coverage: ${reitData.interestCoverage}x
• Funds From Operations Growth: ${reitData.ffoGrowth}%

Risk Assessment: ${reitData.riskLevel}
Investment Thesis: ${reitData.investmentThesis}
Recommendation: ${priceToFFO < 15 && ffoYield > 4 ? 'BUY - Attractive valuation metrics' : priceToFFO > 20 ? 'SELL - Overvalued' : 'HOLD - Fair valuation'}`;

    setAnalysisResult(result);
  };

  const getREITData = (ticker: string) => {
    const reitDatabase: { [key: string]: any } = {
      'O': {
        propertyType: 'Retail (Net Lease)',
        geography: 'United States & Europe',
        portfolio: '12,000+ properties across retail, industrial, and office',
        currentPrice: 58.50,
        nav: 62.00,
        dividendYield: 5.8,
        occupancyRate: 98.2,
        debtToEquity: 0.45,
        interestCoverage: 3.2,
        ffoGrowth: 4.5,
        riskLevel: 'Low-Moderate - Diversified tenant base',
        investmentThesis: 'Monthly dividend aristocrat with strong tenant relationships'
      },
      'VNQ': {
        propertyType: 'Diversified REIT ETF',
        geography: 'United States',
        portfolio: '160+ REITs across all property sectors',
        currentPrice: 85.20,
        nav: 87.50,
        dividendYield: 3.9,
        occupancyRate: 92.5,
        debtToEquity: 0.35,
        interestCoverage: 4.1,
        ffoGrowth: 3.2,
        riskLevel: 'Moderate - Broad market exposure',
        investmentThesis: 'Diversified exposure to US real estate market'
      }
    };

    return reitDatabase[ticker] || {
      propertyType: 'Mixed Property Types',
      geography: 'Various Markets',
      portfolio: 'Diversified real estate portfolio',
      currentPrice: 45.00,
      nav: 48.00,
      dividendYield: 4.5,
      occupancyRate: 90.0,
      debtToEquity: 0.50,
      interestCoverage: 2.8,
      ffoGrowth: 2.0,
      riskLevel: 'Moderate',
      investmentThesis: 'Consult detailed analysis for specific investment thesis'
    };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-xl font-semibold text-gray-300">AI-Powered REIT Analysis</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* REIT Profile & Valuation */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            REIT Profile & Valuation
          </h2>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Analyze Real Estate Investment Trusts using key metrics like FFO.
          </p>
          
          <div className="space-y-4">
            {/* REIT Ticker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                REIT Ticker
              </label>
              <input 
                type="text"
                value={reitTicker}
                onChange={(e) => setReitTicker(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded border border-gray-600 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter REIT ticker"
              />
            </div>

            {/* Est. FFO Per Share */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Est. FFO Per Share ($)
              </label>
              <input 
                type="number"
                step="0.01"
                value={ffoPerShare}
                onChange={(e) => setFfoPerShare(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded border border-gray-600 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter FFO per share"
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
              Enter a REIT ticker and parameters, then click "Generate Analysis" to see the results.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  REIT Analysis Results
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

export default REITs;