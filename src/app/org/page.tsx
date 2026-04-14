import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface OrgNode {
  id: string;
  name: string;
  role: string;
  responsibilities: string[];
  routeWhen: string;
  isHuman?: boolean;
  isOrchestrator?: boolean;
  isChiefOfStaff?: boolean;
}

const ANDREW: OrgNode = {
  id: 'andrew',
  name: 'Andrew',
  role: 'Founder & Final Authority',
  responsibilities: [
    'Sets priorities and overall direction',
    'Approves all outputs and key decisions',
    'Owns the vision and the scorecard',
  ],
  routeWhen: 'Anything that ships, spends money, or touches a client',
  isHuman: true,
};

const ANTIGRAVITY: OrgNode = {
  id: 'antigravity',
  name: 'Antigravity',
  role: 'Orchestration',
  responsibilities: [
    'Dispatches and monitors active agent workflows',
    'Coordinates multi-agent tasks',
    'Operator console — control and visibility',
  ],
  routeWhen: 'Andrew already knows the worker, active sessions need orchestration, long-running processes need monitoring',
  isOrchestrator: true,
};

const DEVROUX: OrgNode = {
  id: 'devroux',
  name: 'Devroux',
  role: 'Chief of Staff',
  responsibilities: [
    'Triage and delegation',
    'Routing tasks to the right agent',
    'Synthesis, review, and protecting Andrew from tool chaos',
  ],
  routeWhen: 'Task is vague, priorities unclear, judgment or delegation needed',
  isChiefOfStaff: true,
};

const WORKERS: OrgNode[] = [
  {
    id: 'grace',
    name: 'Grace / Archon',
    role: 'Builder & Programmer',
    responsibilities: [
      'Primary builder for all creation and rebuilds',
      'Owns client-facing deliverables',
      'Polished docs, designs, and complex artifacts',
    ],
    routeWhen: 'Something must be created or rebuilt, visual quality matters',
  },
  {
    id: 'codex',
    name: 'Codex',
    role: 'Code Reviewer & Programmer',
    responsibilities: [
      'Primary code review lane',
      'Scoped engineering and debugging',
      'Parallel repo work and implementation',
    ],
    routeWhen: 'Code review needed, scoped technical work, debugging',
  },
  {
    id: 'isaac',
    name: 'Isaac',
    role: 'Research',
    responsibilities: [
      'Market research and trend analysis',
      'Competitive intel',
      'Gathering external information for briefs',
    ],
    routeWhen: 'Research tasks, data gathering, market intel',
  },
  {
    id: 'charles',
    name: 'Charles',
    role: 'Writing & Social Drafting',
    responsibilities: [
      'Copy and content writing',
      'Social media drafts',
      'Scripts and long-form content',
    ],
    routeWhen: 'Writing tasks, social posts, scripting, long-form content',
  },
  {
    id: 'ledger',
    name: 'Ledger',
    role: 'Knowledge Vault Steward',
    responsibilities: [
      'Maintaining the Obsidian knowledge vault',
      'Promoting durable context from daily logs',
      'Keeping the second brain clean and current',
    ],
    routeWhen: 'Vault updates, knowledge organization, memory promotion',
  },
  {
    id: 'forge-foreman',
    name: 'Forge Foreman',
    role: 'PM & QA',
    responsibilities: [
      'Project management and tracking',
      'Quality assurance on deliverables',
      'Keeping work on spec and on schedule',
    ],
    routeWhen: 'Project status, QA review, delivery tracking',
  },
];

// Color palette per node type
const nodeStyle = {
  human:        { border: '#E07A5F', bg: '#FFF8F6', dot: '#E07A5F', label: 'text-brand-gold' },
  orchestrator: { border: '#3A6A9A', bg: '#EEF3FA', dot: '#3A6A9A', label: 'text-blue-700' },
  chiefOfStaff: { border: '#9A7A30', bg: '#FBF5E8', dot: '#9A7A30', label: 'text-amber-700' },
  worker:       { border: '#E4E0DA', bg: '#FAFAF8', dot: '#9B9894', label: 'text-brand-medium-gray' },
};

function NodeCard({ node }: { node: OrgNode }) {
  const s = node.isHuman ? nodeStyle.human
    : node.isOrchestrator ? nodeStyle.orchestrator
    : node.isChiefOfStaff ? nodeStyle.chiefOfStaff
    : nodeStyle.worker;

  return (
    <div
      className="rounded-2xl p-5 transition-shadow hover:shadow-md"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      {/* Name + Role */}
      <div className="flex items-start gap-2.5 mb-3">
        <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: s.dot }} />
        <div>
          <div className="forge-heading text-base leading-tight">{node.name}</div>
          <div className={`text-[9px] font-mono font-bold uppercase tracking-[0.15em] mt-0.5 ${s.label}`}>{node.role}</div>
        </div>
      </div>

      {/* Responsibilities */}
      <ul className="space-y-1 mb-3">
        {node.responsibilities.map((r, i) => (
          <li key={i} className="flex items-start gap-1.5 text-[10px] text-brand-slate">
            <span className="text-brand-medium-gray shrink-0 mt-0.5">—</span>
            {r}
          </li>
        ))}
      </ul>

      {/* Route when */}
      <div className="pt-3 border-t border-brand-warm-gray">
        <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-brand-medium-gray">Route when: </span>
        <span className="text-[9px] font-mono text-brand-slate italic">{node.routeWhen}</span>
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="w-px h-6 bg-brand-warm-gray" />
      <div className="w-1.5 h-1.5 rounded-full bg-brand-warm-gray" />
      <div className="w-px h-6 bg-brand-warm-gray" />
    </div>
  );
}

export default function OrgPage() {
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto space-y-10">

      {/* Header */}
      <header className="border-b border-brand-warm-gray pb-6">
        <h1 className="forge-heading text-4xl sm:text-5xl mb-1">
          Org <span className="text-brand-gold">Chart</span>
        </h1>
        <p className="text-brand-medium-gray font-mono text-xs uppercase tracking-[0.25em]">{dateLabel}</p>
      </header>

      {/* Tree */}
      <div className="flex flex-col items-center">

        {/* Andrew */}
        <div className="w-full max-w-sm">
          <NodeCard node={ANDREW} />
        </div>

        <Connector />

        {/* Antigravity — orchestration umbrella */}
        <div className="w-full max-w-sm">
          <NodeCard node={ANTIGRAVITY} />
        </div>

        <Connector />

        {/* Devroux */}
        <div className="w-full max-w-sm">
          <NodeCard node={DEVROUX} />
        </div>

        {/* Branch line to workers */}
        <div className="flex flex-col items-center py-1">
          <div className="w-px h-6 bg-brand-warm-gray" />
          <div className="w-1.5 h-1.5 rounded-full bg-brand-warm-gray" />
        </div>

        {/* Horizontal span */}
        <div className="w-full relative">
          {/* Top horizontal bar */}
          <div className="absolute top-0 left-[8.333%] right-[8.333%] h-px bg-brand-warm-gray" />

          {/* Worker columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6">
            {WORKERS.map(worker => (
              <div key={worker.id} className="flex flex-col items-center">
                <div className="w-px h-6 bg-brand-warm-gray mb-0" />
                <NodeCard node={worker} />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Legend */}
      <div className="forge-panel">
        <div className="forge-label mb-4">Legend</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { color: nodeStyle.human.dot, label: 'Human (Andrew)' },
            { color: nodeStyle.orchestrator.dot, label: 'Orchestration Layer' },
            { color: nodeStyle.chiefOfStaff.dot, label: 'Chief of Staff' },
            { color: nodeStyle.worker.dot, label: 'Specialist Agent' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
              <span className="text-[10px] font-mono text-brand-slate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Routing guide */}
      <div className="forge-panel">
        <div className="forge-label mb-4">Routing Quick Reference</div>
        <div className="space-y-2">
          {[ANTIGRAVITY, DEVROUX, ...WORKERS].map(node => (
            <div key={node.id} className="flex items-start gap-3 py-1.5 border-b border-brand-warm-gray last:border-0">
              <span className="text-[10px] font-mono font-bold text-brand-ink w-32 shrink-0">{node.name}</span>
              <span className="text-[10px] font-mono text-brand-slate italic">{node.routeWhen}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
