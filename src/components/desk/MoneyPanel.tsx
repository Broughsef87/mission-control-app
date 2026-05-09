"use client";

import useSWR from 'swr';
import { formatDistanceToNow } from 'date-fns';

const fetcher = (url: string) => fetch(url).then(r => r.json());
const REFRESH = 5 * 60 * 1000;

interface MoneyData {
  configured: boolean;
  mrr: string;
  mrr_cents: number;
  active_subscriptions: number;
  cash_in_week: string;
  failed_payments: number;
  disputes: number;
  new_subs_mtd: number;
  churned_mtd: number;
  as_of: string;
  error?: string;
}

export default function MoneyPanel() {
  const { data, isValidating, error } = useSWR<MoneyData>(
    '/api/morning-desk/money',
    fetcher,
    { refreshInterval: REFRESH, revalidateOnFocus: false }
  );

  const isAlert = data && (data.failed_payments > 0 || data.disputes > 0);

  return (
    <div className="forge-panel flex flex-col gap-0 h-full" style={{ borderColor: isAlert ? 'rgba(220,38,38,0.4)' : undefined }}>
      <PanelHeader label="Money" cadence="5m" validating={isValidating} asOf={data?.as_of} />

      {!data && !error && <Skeleton rows={5} />}
      {error && <ErrMsg msg="Failed to load" />}

      {data && !data.configured && (
        <ErrMsg msg="STRIPE_SECRET_KEY not configured" />
      )}

      {data?.configured && (
        <div className="flex flex-col gap-2 mt-2">
          <BigStat label="MRR" value={data.mrr} color="var(--ab-gold)" />
          <Divider />
          <SmallRow label="Cash in (7d)" value={data.cash_in_week} />
          <SmallRow label="Active subs" value={String(data.active_subscriptions)} />
          <SmallRow label="New MTD" value={String(data.new_subs_mtd)} valueColor="var(--ab-green)" />
          <SmallRow label="Churned MTD" value={String(data.churned_mtd)} valueColor={data.churned_mtd > 0 ? 'var(--ab-gold)' : undefined} />
          {data.failed_payments > 0 && (
            <SmallRow label="Failed payments" value={String(data.failed_payments)} valueColor="var(--ab-red)" alert />
          )}
          {data.disputes > 0 && (
            <SmallRow label="Disputes" value={String(data.disputes)} valueColor="var(--ab-red)" alert />
          )}
        </div>
      )}
    </div>
  );
}

function BigStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="forge-label mb-0.5">{label}</div>
      <div className="font-mono font-black text-3xl tabular-nums leading-none" style={{ color: color ?? 'var(--ab-text)' }}>
        {value}
      </div>
    </div>
  );
}

function SmallRow({ label, value, valueColor, alert }: { label: string; value: string; valueColor?: string; alert?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-mono" style={{ color: 'var(--ab-muted)' }}>{label}</span>
      <span className="text-[11px] font-mono font-bold tabular-nums" style={{ color: valueColor ?? 'var(--ab-text)' }}>
        {alert && <span className="mr-1" style={{ color: 'var(--ab-red)' }}>⚠</span>}
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: '1px', background: 'var(--ab-border)', margin: '2px 0' }} />;
}

function Skeleton({ rows }: { rows: number }) {
  return (
    <div className="flex flex-col gap-2 mt-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 rounded animate-pulse" style={{ background: 'var(--ab-border)', width: `${55 + (i % 3) * 15}%` }} />
      ))}
    </div>
  );
}

function ErrMsg({ msg }: { msg: string }) {
  return <p className="text-[10px] font-mono mt-2" style={{ color: 'var(--ab-muted)' }}>{msg}</p>;
}

function PanelHeader({ label, cadence, validating, asOf }: { label: string; cadence: string; validating: boolean; asOf?: string }) {
  return (
    <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid var(--ab-border)' }}>
      <span className="forge-label">{label}</span>
      <div className="flex items-center gap-2">
        {asOf && (
          <span className="text-[8px] font-mono" style={{ color: 'var(--ab-muted)' }}>
            {formatDistanceToNow(new Date(asOf), { addSuffix: true })}
          </span>
        )}
        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ color: 'var(--ab-muted)', border: '1px solid var(--ab-border)' }}>{cadence}</span>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: validating ? 'var(--ab-gold)' : 'var(--ab-green)', animation: validating ? 'pulse-glow 1s ease-in-out infinite' : undefined }} />
      </div>
    </div>
  );
}
