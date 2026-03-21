import React from 'react';

interface TokenLog {
  id: string;
  agent: string;
  model: string;
  tokens: number;
  cost: number;
  timestamp: string;
}

export default function BurnMeter({ logs }: { logs: TokenLog[] }) {
  const totalCost = logs.reduce((acc, log) => acc + log.cost, 0);
  const totalTokens = logs.reduce((acc, log) => acc + log.tokens, 0);
  const dailyBudget = 5.00; // Mock budget
  const percentOfBudget = Math.min((totalCost / dailyBudget) * 100, 100);

  return (
    <div className="bg-forge-panel/40 border border-white/5 rounded-sm p-6 backdrop-blur-sm relative overflow-hidden group hover:border-forge-red/30 transition-all">
      <div className="absolute top-0 right-0 p-3 font-mono text-[9px] text-gray-700 tracking-widest uppercase">The Burn // token economy</div>
      <h3 className="text-lg font-bold mb-6 tracking-tight flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-forge-red animate-pulse"></span>
        Burn Meter
      </h3>

      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Daily Spend</span>
          <span className="text-xl font-black text-white">${totalCost.toFixed(2)}</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${percentOfBudget > 80 ? 'bg-forge-red' : 'bg-forge-orange'}`}
            style={{ width: `${percentOfBudget}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] font-mono text-gray-700 uppercase">0.00</span>
          <span className="text-[8px] font-mono text-gray-700 uppercase">Budget: ${dailyBudget.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] border-b border-white/5 pb-2 mb-2">
          <span className="text-gray-500 font-mono">Agent</span>
          <span className="text-gray-500 font-mono">Tokens</span>
        </div>
        {logs.slice(0, 5).map(log => (
          <div key={log.id} className="flex justify-between text-[10px] items-center">
            <span className="font-bold text-white/80">{log.agent}</span>
            <span className="font-mono text-gray-400">{log.tokens.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
