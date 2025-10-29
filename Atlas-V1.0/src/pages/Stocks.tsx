import React, { useState } from 'react';

const Stocks: React.FC = () => {
  const [activeModel, setActiveModel] = useState('DCF');
  const [ticker, setTicker] = useState('AAPL');
  const [growthRate, setGrowthRate] = useState('10');
  const [discountRate, setDiscountRate] = useState('8');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const models = ['DCF', 'Graham', 'Safety Margin'];

  const handleGenerateAnalysis = () => {
    let result = '';
    
    switch (activeModel) {
      case 'DCF':
        const dcfValue = calculateDCF();
        result = `DCF Analysis for ${ticker}: Estimated fair value is $${dcfValue.toFixed(2)} based on ${growthRate}% growth rate and ${discountRate}% discount rate. Current market conditions suggest ${dcfValue > 150 ? 'overvalued' : 'undervalued'} position.`;
        break;
      case 'Graham':
        const grahamValue = calculateGraham();
        result = `Graham Analysis for ${ticker}: Intrinsic value estimated at $${grahamValue.toFixed(2)} using Benjamin Graham's formula. The stock appears ${grahamValue > 150 ? 'fairly valued' : 'potentially undervalued'} based on earnings and book value metrics.`;
        break;
      case 'Safety Margin':
        const safetyMargin = calculateSafetyMargin();
        result = `Safety Margin Analysis for ${ticker}: With a ${safetyMargin.toFixed(1)}% safety margin, the stock ${safetyMargin > 20 ? 'meets' : 'does not meet'} conservative investment criteria. Recommended position size: ${safetyMargin > 20 ? 'Standard' : 'Reduced'}.`;
        break;
    }
    
    setAnalysisResult(result);
  };

  const calculateDCF = () => {
    const growth = parseFloat(growthRate) / 100;
    const discount = parseFloat(discountRate) / 100;
    const baseEarnings = 6.05; // AAPL base earnings
    return (baseEarnings * (1 + growth)) / (discount - growth) * 10;
  };

  const calculateGraham = () => {
    const eps = 6.05;
    const bookValue = 4.40;
    return Math.sqrt(22.5 * eps * bookValue);
  };

  const calculateSafetyMargin = () => {
    const currentPrice = 150;
    const intrinsicValue = calculateDCF();
    return ((intrinsicValue - currentPrice) / intrinsicValue) * 100;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-xl font-semibold text-gray-300">AI-Powered Stock Analysis Models</h1>

      {/* Model Tabs */}
      <div className="flex space-x-2">
        {models.map((model) => (
          <button
            key={model}
            onClick={() => setActiveModel(model)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              activeModel === model
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 dark:bg-slate-700 text-gray-300 hover:bg-slate-600 dark:hover:bg-slate-600'
            }`}
          >
            {model}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analysis Parameters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          <div className="space-y-4">
            {/* Ticker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ticker
              </label>
              <input 
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded border border-gray-600 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter stock ticker"
              />
            </div>

            {/* Est. Growth Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Est. Growth Rate (%)
              </label>
              <input 
                type="number"
                value={growthRate}
                onChange={(e) => setGrowthRate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded border border-gray-600 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter growth rate"
              />
            </div>

            {/* Discount Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Discount Rate (%)
              </label>
              <input 
                type="number"
                value={discountRate}
                onChange={(e) => setDiscountRate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded border border-gray-600 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter discount rate"
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
              Select a model, enter parameters, and click "Generate Analysis" to see the results.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  {activeModel} Analysis Results
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {analysisResult}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded">
                  <p className="text-gray-600 dark:text-gray-400">Model</p>
                  <p className="font-medium text-gray-900 dark:text-white">{activeModel}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded">
                  <p className="text-gray-600 dark:text-gray-400">Ticker</p>
                  <p className="font-medium text-gray-900 dark:text-white">{ticker}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded">
                  <p className="text-gray-600 dark:text-gray-400">Growth Rate</p>
                  <p className="font-medium text-gray-900 dark:text-white">{growthRate}%</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded">
                  <p className="text-gray-600 dark:text-gray-400">Discount Rate</p>
                  <p className="font-medium text-gray-900 dark:text-white">{discountRate}%</p>
                </div>
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

export default Stocks;