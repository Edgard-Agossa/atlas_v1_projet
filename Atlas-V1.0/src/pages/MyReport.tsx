import React, { useState } from 'react';

const MyReport: React.FC = () => {
  const [memberId, setMemberId] = useState('');
  const [email, setEmail] = useState('');

  const handleGenerateReport = () => {
    console.log('Generating report for:', { memberId, email });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
      {/* Club Performance Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Club Performance Overview</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Here is the overall performance trend of the club against the benchmark (S&P 500).</p>
        
        {/* Chart Container */}
        <div className="relative h-80 bg-gray-100 dark:bg-slate-700 rounded-lg p-4">
          <svg className="w-full h-full" viewBox="0 0 800 300">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#374151" strokeWidth="1" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Y-axis labels */}
            <text x="20" y="50" className="fill-gray-500 dark:fill-gray-400" fontSize="12">$30k</text>
            <text x="20" y="100" className="fill-gray-500 dark:fill-gray-400" fontSize="12">$27k</text>
            <text x="20" y="150" className="fill-gray-500 dark:fill-gray-400" fontSize="12">$18k</text>
            <text x="20" y="200" className="fill-gray-500 dark:fill-gray-400" fontSize="12">$9k</text>
            <text x="20" y="250" className="fill-gray-500 dark:fill-gray-400" fontSize="12">$0k</text>
            
            {/* Benchmark line (green) */}
            <polyline
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              points="50,200 100,190 150,185 200,180 250,175 300,170 350,165 400,160 450,155 500,150 550,145 600,140 650,135 700,130 750,125"
            />
            
            {/* Club performance line (blue) */}
            <polyline
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              points="50,220 100,210 150,205 200,200 250,195 300,190 350,185 400,180 450,175 500,170 550,165 600,160 650,155 700,150 750,145"
            />
            
            {/* Data points */}
            {[50,100,150,200,250,300,350,400,450,500,550,600,650,700,750].map((x, i) => (
              <g key={i}>
                <circle cx={x} cy={200 - i * 5} r="3" fill="#10B981" />
                <circle cx={x} cy={220 - i * 5} r="3" fill="#3B82F6" />
              </g>
            ))}
            
            {/* X-axis labels */}
            <text x="50" y="290" className="fill-gray-500 dark:fill-gray-400" fontSize="10">Nov 20</text>
            <text x="150" y="290" className="fill-gray-500 dark:fill-gray-400" fontSize="10">May 21</text>
            <text x="250" y="290" className="fill-gray-500 dark:fill-gray-400" fontSize="10">Nov 21</text>
            <text x="350" y="290" className="fill-gray-500 dark:fill-gray-400" fontSize="10">May 22</text>
            <text x="450" y="290" className="fill-gray-500 dark:fill-gray-400" fontSize="10">Nov 22</text>
            <text x="550" y="290" className="fill-gray-500 dark:fill-gray-400" fontSize="10">May 23</text>
            <text x="650" y="290" className="fill-gray-500 dark:fill-gray-400" fontSize="10">Nov 23</text>
            <text x="750" y="290" className="fill-gray-500 dark:fill-gray-400" fontSize="10">Aug 25</text>
          </svg>
          
          {/* Legend */}
          <div className="absolute bottom-4 right-4 flex space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-green-400 text-sm">Benchmark</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-blue-400 text-sm">Club NAV</span>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Personal Report */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Generate Personal Report</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Enter your Member ID and Email to generate your personalized report:</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Member ID</label>
            <input
              type="text"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={handleGenerateReport}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyReport;