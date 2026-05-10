'use client';

import { Users } from 'lucide-react';

export default function TeamPage() {
  return (
    <div className="flex flex-col items-center p-8 text-ab-body w-full h-full overflow-y-auto">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-12 py-10 rounded-3xl mb-16 shadow-[0_0_40px_rgba(59,130,246,0.3)] border border-ab-blue/30 text-center relative overflow-hidden group max-w-4xl min-h-[160px] flex flex-col justify-center">
        <div className="absolute top-0 left-0 w-full h-full bg-ab-text/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <h1 className="text-4xl font-bold tracking-tight text-ab-body drop-shadow-md mb-4">"Producing Value 24/7"</h1>
        <div className="flex items-center justify-center gap-4 text-ab-blue text-sm font-medium tracking-wide">
            <span className="bg-ab-blue/20 px-4 py-1.5 rounded-full border border-ab-blue/20">Target: $1,000,000/yr Revenue</span>
            <span className="text-ab-blue">•</span>
            <span className="bg-ab-blue/20 px-4 py-1.5 rounded-full border border-ab-blue/20">Financial Freedom</span>
        </div>
      </div>

      <div className="flex flex-col items-center w-full max-w-6xl pb-20">
        
        {/* Level 1: CEO */}
        <div className="relative group z-30 mb-20">
           <AgentCard 
             role="Commander / CEO" 
             name="Andrew" 
             desc="Visionary. Final approver. Creator of content. The human in the loop."
             // Using DiceBear 9.x with specific params for a reliable masculine 'Commander' look
             avatar="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&top=shortFlat&facialHair=beardLight&clothing=blazerAndShirt&style=circle"
             isCeo
           />
           {/* Line down to Level 2 */}
           <div className="absolute left-1/2 -bottom-20 w-0.5 h-20 bg-gradient-to-b from-yellow-500/50 to-ab-border -translate-x-1/2 z-0"></div>
        </div>

        {/* Level 2: COO */}
        <div className="relative group z-20 mb-20">
           <AgentCard 
             role="Chief of Staff / Ops" 
             name="Devroux" 
             desc="Execution. Coding. Organization. Managing the sub-agents and keeping the ship afloat."
             avatar="https://api.dicebear.com/9.x/bottts/svg?seed=Devroux&colors=blue"
           />
           {/* Line down to Level 3 Split */}
           <div className="absolute left-1/2 -bottom-20 w-0.5 h-20 bg-ab-border -translate-x-1/2 z-0"></div>
        </div>

        {/* Level 3: Specialists Container */}
        <div className="relative flex justify-center gap-6 w-full flex-wrap max-w-5xl">
            
            {/* Horizontal Connector Bar - Spans the width */}
            <div className="absolute -top-10 left-[10%] right-[10%] h-0.5 bg-ab-border hidden lg:block"></div>
            
            {/* Vertical Connector from Bar to Cards (Simplified for responsive) */}
            <div className="absolute -top-10 left-1/2 h-10 w-0.5 bg-ab-border -translate-x-1/2 hidden lg:block"></div>


            {/* Agent 1: Isaac */}
            <div className="flex flex-col items-center relative mt-4">
               <div className="absolute -top-14 left-1/2 h-14 w-0.5 bg-ab-border -translate-x-1/2 hidden lg:block"></div>
               <AgentCard 
                 role="Intelligence (Researcher)" 
                 name="Isaac" 
                 desc="Trend hunting. YouTube analytics. Topic validation. Digs deep so we don't guess."
                 avatar="https://api.dicebear.com/9.x/bottts/svg?seed=Isaac&colors=green"
               />
            </div>

            {/* Agent 2: Charles */}
            <div className="flex flex-col items-center relative mt-4">
               <div className="absolute -top-14 left-1/2 h-14 w-0.5 bg-ab-border -translate-x-1/2 hidden lg:block"></div>
               <AgentCard 
                 role="Production (Producer)" 
                 name="Charles" 
                 desc="Script outlining. Packaging. Thumbnail concepts. Turns data into stories."
                 avatar="https://api.dicebear.com/9.x/bottts/svg?seed=Charles&colors=purple"
               />
            </div>

            {/* Agent 3: Max */}
            <div className="flex flex-col items-center relative mt-4">
               <div className="absolute -top-14 left-1/2 h-14 w-0.5 bg-ab-border -translate-x-1/2 hidden lg:block"></div>
               <AgentCard 
                 role="Engineering (Lead)" 
                 name="Max" 
                 desc="Full-stack dev. Next.js & Supabase specialist."
                 avatar="https://api.dicebear.com/9.x/bottts/svg?seed=Max&colors=amber"
               />
               
               {/* Sub-agent connection to Oscar */}
               <div className="w-0.5 h-10 bg-ab-border"></div>
               <div className="w-48 p-3 rounded-xl border border-ab-border border-dashed bg-ab-surface flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mb-2 border-2 border-ab-border">
                    <img src="https://api.dicebear.com/9.x/bottts/svg?seed=Oscar&colors=cyan" alt="Oscar" />
                  </div>
                  <div className="text-[8px] font-bold text-ab-blue uppercase tracking-widest">Junior Engineer</div>
                  <div className="text-xs font-bold text-ab-text">Oscar</div>
                  <div className="text-[9px] text-ab-muted text-center mt-1">Works under Max. Prototyping B2B tools and supporting app feature development.</div>
               </div>
            </div>

            {/* Agent 4: Gabriel */}
            <div className="flex flex-col items-center relative mt-4">
               <div className="absolute -top-14 left-1/2 h-14 w-0.5 bg-ab-border -translate-x-1/2 hidden lg:block"></div>
               <AgentCard 
                 role="Watchdog (SRE)" 
                 name="Gabriel" 
                 desc="System Reliability. Ensures The Foundry stays online 24/7. The silent guardian."
                 avatar="https://api.dicebear.com/9.x/bottts/svg?seed=Gabriel&colors=red"
               />
            </div>

            {/* Agent 5: Ollie */}
            <div className="flex flex-col items-center relative mt-4">
               <div className="absolute -top-14 left-1/2 h-14 w-0.5 bg-ab-border -translate-x-1/2 hidden lg:block"></div>
               <AgentCard 
                 role="Social Media (Marketing)" 
                 name="Ollie" 
                 desc="Repurpose & Amplify. Turns videos into threads and posts for X & Instagram."
                 avatar="https://api.dicebear.com/9.x/bottts/svg?seed=Ollie&colors=pink"
               />
            </div>

            {/* Agent 6: Leo */}
            <div className="flex flex-col items-center relative mt-4">
               <div className="absolute -top-14 left-1/2 h-14 w-0.5 bg-ab-border -translate-x-1/2 hidden lg:block"></div>
               <AgentCard 
                 role="Product Manager (Monetization)" 
                 name="Leo" 
                 desc="The Money Maker. Designs digital products (Notion Templates, eBooks) and sales copy."
                 avatar="https://api.dicebear.com/9.x/bottts/svg?seed=Leo&colors=teal"
               />
            </div>

            {/* Agent 7: Scribe */}
            <div className="flex flex-col items-center relative mt-4">
               <div className="absolute -top-14 left-1/2 h-14 w-0.5 bg-ab-border -translate-x-1/2 hidden lg:block"></div>
               <AgentCard 
                 role="Data Ingestion" 
                 name="Scribe" 
                 desc="Sweeps Discord drops, captures Granola meetings, runs weekly client digester."
                 avatar="https://api.dicebear.com/9.x/bottts/svg?seed=Scribe&colors=orange"
               />
            </div>
        </div>
      </div>
    </div>
  );
}

function AgentCard({ role, name, desc, avatar, isCeo = false }: { role: string, name: string, desc: string, avatar: string, isCeo?: boolean }) {
  return (
    <div className={`
      relative w-64 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center bg-ab-surface-2
      ${isCeo ? 'border-ab-gold/40 bg-gradient-to-b from-ab-surface-2 to-ab-base' : 'border-ab-border hover:border-ab-blue/40'}
    `}>
      <div className={`
        w-20 h-20 rounded-full overflow-hidden mb-3 border-4 bg-ab-surface shrink-0
        ${isCeo ? 'border-ab-gold shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'border-ab-base'}
      `}>
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
      
      <div className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-1 ${isCeo ? 'text-ab-gold' : 'text-ab-blue'}`}>
        {role}
      </div>
      
      <h3 className="text-lg font-bold text-ab-text mb-2">{name}</h3>
      
      <p className="text-[11px] text-ab-body leading-relaxed px-1">
        {desc}
      </p>
    </div>
  );
}


