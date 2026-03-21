import React from 'react';

interface Action {
  id: string;
  agent: string;
  action: string;
  path: string | null;
  timestamp: string;
}

export default function AgentHeatmap({ actions }: { actions: Action[] }) {
  return (
    <div className="bg-forge-panel/40 border border-white/5 rounded-sm p-6 backdrop-blur-sm relative overflow-hidden group hover:border-forge-orange/30 transition-all">
      <div className="absolute top-0 right-0 p-3 font-mono text-[9px] text-gray-700 tracking-widest uppercase">Agent Heatmap // movements</div>
      <h3 className="text-lg font-bold mb-6 tracking-tight flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-forge-orange animate-pulse"></span>
        Workspace Heat
      </h3>
      
      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
        {actions.length === 0 ? (
          <p className="text-gray-600 text-xs italic">No movement detected...</p>
        ) : (
          actions.map((action) => (
            <div key={action.id} className="flex items-start gap-3 border-l border-white/5 pl-3 py-1 hover:border-forge-orange/50 transition-colors">
              <div className="font-mono text-[10px] font-bold text-forge-orange min-w-[50px] uppercase">{action.agent}</div>
              <div className="flex-1">
                <div className="text-[10px] text-white/90 font-medium">
                  {action.action} <span className="text-gray-500 font-normal">{action.path}</span>
                </div>
                <div className="text-[8px] text-gray-700 uppercase tracking-tighter">
                  {new Date(action.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
