import { getDailyLogs } from '@/lib/db';
import { BookOpen, Calendar } from 'lucide-react';

function renderMarkdown(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      nodes.push(
        <h3 key={key++} className="text-sm font-bold text-brand-ink mt-5 mb-1.5 font-mono uppercase tracking-wider">
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith('# ')) {
      nodes.push(
        <h2 key={key++} className="text-base font-black text-brand-ink mb-2 forge-heading">
          {line.slice(2)}
        </h2>
      );
    } else if (line.startsWith('- **') || line.startsWith('  - ')) {
      const text = line.replace(/^\s*-\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1');
      nodes.push(
        <div key={key++} className="flex gap-2 text-xs text-brand-slate leading-relaxed ml-2">
          <span className="text-brand-gold mt-0.5 shrink-0">›</span>
          <span>{text}</span>
        </div>
      );
    } else if (line.startsWith('- ')) {
      const text = line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1');
      nodes.push(
        <div key={key++} className="flex gap-2 text-xs text-brand-slate leading-relaxed">
          <span className="text-brand-gold mt-0.5 shrink-0">·</span>
          <span>{text}</span>
        </div>
      );
    } else if (line.trim() === '') {
      nodes.push(<div key={key++} className="h-1" />);
    } else {
      const text = line.replace(/\*\*(.*?)\*\*/g, '$1');
      nodes.push(
        <p key={key++} className="text-xs text-brand-slate leading-relaxed">
          {text}
        </p>
      );
    }
  }

  return nodes;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function DailyLogsPage() {
  const logs = await getDailyLogs(60).catch(() => []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-brand-warm-gray pb-8">
        <div>
          <h1 className="forge-heading text-4xl sm:text-5xl mb-2">
            Daily <span className="text-brand-gold">Logs</span>
          </h1>
          <p className="text-brand-medium-gray font-mono text-xs uppercase tracking-[0.3em]">
            OpenClaw Work Journal // {logs.length} entries
          </p>
        </div>
        <div className="flex items-center gap-2 bg-brand-parchment border border-brand-warm-gray px-4 py-2 rounded-xl">
          <BookOpen size={14} className="text-brand-gold" />
          <span className="text-[10px] text-brand-ink font-bold uppercase tracking-widest">Memory Feed</span>
        </div>
      </header>

      {/* Log entries */}
      {logs.length === 0 ? (
        <div className="forge-panel flex items-center justify-center py-20">
          <div className="text-center">
            <BookOpen size={32} className="text-brand-medium-gray mx-auto mb-3" />
            <p className="text-brand-medium-gray text-sm">No logs synced yet.</p>
            <p className="text-brand-medium-gray text-xs mt-1 font-mono">Run: node scripts/sync-memory-logs.js</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {(logs as Array<{ id: string; log_date: string; content: string; synced_at: string }>).map((log) => (
            <article key={log.id} className="forge-panel !rounded-2xl overflow-hidden">
              {/* Date header */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-brand-warm-gray">
                <div className="p-2 bg-brand-gold/10 border border-brand-gold/20 rounded-lg">
                  <Calendar size={14} className="text-brand-gold" />
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-ink forge-heading">{formatDate(log.log_date)}</div>
                  <div className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest">
                    synced {new Date(log.synced_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-0.5">
                {renderMarkdown(log.content)}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
