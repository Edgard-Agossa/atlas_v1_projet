import React, { useState } from 'react';

const Bonds: React.FC = () => {
  const [issuerSymbol, setIssuerSymbol] = useState('GOVT');
  const [faceValue, setFaceValue] = useState('1000');
  const [couponRate, setCouponRate] = useState('5');
  const [yearsToMaturity, setYearsToMaturity] = useState('10');
  const [marketRate, setMarketRate] = useState('6');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const handleGenerateAnalysis = () => {
    const face = parseFloat(faceValue);
    const coupon = parseFloat(couponRate) / 100;
    const years = parseFloat(yearsToMaturity);
    const market = parseFloat(marketRate) / 100;
    
    // Calculate bond price using present value formula
    const annualCoupon = face * coupon;
    let presentValue = 0;
    
    // Present value of coupon payments
    for (let i = 1; i <= years; i++) {
      presentValue += annualCoupon / Math.pow(1 + market, i);
    }
    
    // Present value of face value
    presentValue += face / Math.pow(1 + market, years);
    
    const currentYield = (annualCoupon / presentValue) * 100;
    const yieldToMaturity = market * 100;
    const duration = calculateDuration(face, coupon, years, market);
    
    const recommendation = presentValue > face ? 'Premium Bond - Consider if seeking steady income' : 
                          presentValue < face ? 'Discount Bond - Attractive capital appreciation potential' :
                          'Par Bond - Fair value pricing';
    
    const result = `Bond Analysis for ${issuerSymbol}:
    
Fair Value: $${presentValue.toFixed(2)}
Current Yield: ${currentYield.toFixed(2)}%
Yield to Maturity: ${yieldToMaturity.toFixed(2)}%
Modified Duration: ${duration.toFixed(2)} years

${recommendation}

Interest Rate Risk: ${duration > 7 ? 'High' : duration > 4 ? 'Moderate' : 'Low'} - Bond price sensitivity to rate changes.
Credit Quality: Government bonds typically offer lower risk with stable returns.`;

    setAnalysisResult(result);
  };

  const calculateDuration = (face: number, coupon: number, years: number, market: number) => {
    const annualCoupon = face * coupon;
    let weightedTime = 0;
    let bondPrice = 0;
    
    for (let i = 1; i <= years; i++) {
      const pv = annualCoupon / Math.pow(1 + market, i);
      weightedTime += (i * pv);
      bondPrice += pv;
    }
    
    const finalPV = face / Math.pow(1 + market, years);
    weightedTime += (years * finalPV);
    bondPrice += finalPV;
    
    return weightedTime / bondPrice;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-xl font-semibold text-gray-300">AI-Powered Bond Analysis</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bond Valuation Model */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Bond Valuation Model
          </h2>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            This model explains and calculates bond valuation based on discounted cash flows (coupon payments and face value).
          </p>
          
          <div className="space-y-4">
            {/* Issuer/Symbol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Issuer/Symbol
              </label>
              <input 
                type="text"
                value={issuerSymbol}
                onChange={(e) => setIssuerSymbol(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded border border-gray-600 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter bond issuer/symbol"
              />
            </div>

            {/* Face Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Face Value ($)
              </label>
              <input 
                type="number"
                value={faceValue}
                onChange={(e) => setFaceValue(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded border border-gray-600 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter face value"
              />
            </div>

            {/* Coupon Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Coupon Rate (%)
              </label>
              <input 
                type="number"
                step="0.1"
                value={couponRate}
                onChange={(e) => setCouponRate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded border border-gray-600 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter coupon rate"
              />
            </div>

            {/* Years to Maturity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Years to Maturity
              </label>
              <input 
                type="number"
                value={yearsToMaturity}
                onChange={(e) => setYearsToMaturity(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded border border-gray-600 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter years to maturity"
              />
            </div>

            {/* Market Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Market Rate (%)
              </label>
              <input 
                type="number"
                step="0.1"
                value={marketRate}
                onChange={(e) => setMarketRate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded border border-gray-600 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter market rate"
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
              Enter bond parameters and click "Generate Analysis" to see the results.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Bond Valuation Results
                </h3>
                <pre className="text-sm text-blue-700 dark:text-blue-400 whitespace-pre-wrap font-mono">
                  {analysisResult}
                </pre>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded">
                  <p className="text-gray-600 dark:text-gray-400">Issuer</p>
                  <p className="font-medium text-gray-900 dark:text-white">{issuerSymbol}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded">
                  <p className="text-gray-600 dark:text-gray-400">Face Value</p>
                  <p className="font-medium text-gray-900 dark:text-white">${faceValue}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded">
                  <p className="text-gray-600 dark:text-gray-400">Coupon Rate</p>
                  <p className="font-medium text-gray-900 dark:text-white">{couponRate}%</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded">
                  <p className="text-gray-600 dark:text-gray-400">Maturity</p>
                  <p className="font-medium text-gray-900 dark:text-white">{yearsToMaturity} years</p>
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

export default Bonds;