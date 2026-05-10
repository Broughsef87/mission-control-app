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
  name: 'Grav',
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
    id: 'claude-code',
    name: 'Claude Code',
    role: 'Terminal Ops & Coordination',
    responsibilities: [
      'Executing terminal commands and scripts',
      'Running background ops and dev tools',
      'Coordinating shell-level workflows',
    ],
    routeWhen: 'Terminal operations, running scripts, devops and server management',
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
  {
    id: 'scribe',
    name: 'Scribe',
    role: 'Data Ingestion & Capture',
    responsibilities: [
      'Granola meeting capture',
      'Discord drop-inbox sweeps',
      'Weekly client thread digester',
    ],
    routeWhen: 'Meeting notes, dropped screenshots or thoughts, weekly client communications rollup',
  },
];

// Color palette per node type using design system signal colors
const nodeStyle = {
  human:        { border: 'rgba(232,163,32,0.3)', dot: 'var(--ab-gold)', label: 'text-ab-gold' },
  orchestrator: { border: 'rgba(30,111,255,0.3)', dot: 'var(--ab-blue)', label: 'text-ab-blue' },
  chiefOfStaff: { border: 'rgba(220,38,38,0.3)', dot: 'var(--ab-red)', label: 'text-ab-red' },
  worker:       { border: 'var(--ab-border)', dot: 'var(--ab-muted)', label: 'text-ab-muted' },
};

function NodeCard({ node }: { node: OrgNode }) {
  const s = node.isHuman ? nodeStyle.human
    : node.isOrchestrator ? nodeStyle.orchestrator
    : node.isChiefOfStaff ? nodeStyle.chiefOfStaff
    : nodeStyle.worker;

  return (
    <div
      className="forge-card"
      style={{ borderColor: s.border }}
    >
      {/* Name + Role */}
      <div className="flex items-start gap-2.5 mb-3">
        <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: s.dot, boxShadow: `0 0 6px ${s.dot}` }} />
        <div>
          <div className="text-ab-body font-bold text-lg leading-tight">{node.name}</div>
          <div className={`font-mono text-[10px] tracking-[0.12em] uppercase mt-0.5 ${s.label}`}>{node.role}</div>
        </div>
      </div>

      {/* Responsibilities */}
      <ul className="space-y-1 mb-4">
        {node.responsibilities.map((r, i) => (
          <li key={i} className="flex items-start gap-1.5 text-xs text-ab-body">
            <span className="text-ab-muted shrink-0 mt-0.5">—</span>
            {r}
          </li>
        ))}
      </ul>

      {/* Route when */}
      <div className="pt-3 border-t border-ab-border">
        <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-ab-muted">Route when: </span>
        <span className="text-xs text-ab-body italic">{node.routeWhen}</span>
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="w-px h-6 bg-ab-border" />
      <div className="w-1.5 h-1.5 rounded-full bg-ab-border" />
      <div className="w-px h-6 bg-ab-border" />
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
      <header className="border-b border-ab-border pb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-4xl sm:text-5xl font-bold text-ab-text">
            Org <span className="text-ab-gold">Chart</span>
          </h1>
          <span className="chip chip-quarters">WIP</span>
        </div>
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-ab-muted">{dateLabel}</p>
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
          <div className="w-px h-6 bg-ab-border" />
          <div className="w-1.5 h-1.5 rounded-full bg-ab-border" />
        </div>

        {/* Horizontal span */}
        <div className="w-full relative">
          {/* Top horizontal bar */}
          <div className="absolute top-0 left-[8.333%] right-[8.333%] h-px bg-ab-border" />

          {/* Worker columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6">
            {WORKERS.map(worker => (
              <div key={worker.id} className="flex flex-col items-center">
                <div className="w-px h-6 bg-ab-border mb-0" />
                <NodeCard node={worker} />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Legend */}
      <div className="forge-card">
        <div className="ab-overline">Legend</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { color: nodeStyle.human.dot, label: 'Human (Andrew)' },
            { color: nodeStyle.orchestrator.dot, label: 'Orchestration Layer' },
            { color: nodeStyle.chiefOfStaff.dot, label: 'Chief of Staff' },
            { color: nodeStyle.worker.dot, label: 'Specialist Agent' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
              <span className="font-mono text-[10px] text-ab-muted">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Routing guide */}
      <div className="forge-card">
        <div className="ab-overline">Routing Quick Reference</div>
        <div className="space-y-2">
          {[ANTIGRAVITY, DEVROUX, ...WORKERS].map(node => (
            <div key={node.id} className="flex items-start gap-3 py-1.5 border-b border-ab-border last:border-0">
              <span className="font-mono text-[11px] text-ab-body w-32 shrink-0">{node.name}</span>
              <span className="text-xs text-ab-body italic">{node.routeWhen}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
