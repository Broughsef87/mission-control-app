"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

export default function CheckinPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const [date, setDate] = useState(today);
  const [priorities, setPriorities] = useState(['', '', '']);
  const [blocker, setBlocker] = useState('');
  const [numbers, setNumbers] = useState<{ key: string; value: string }[]>([
    { key: 'Revenue', value: '' },
    { key: 'Outreach', value: '' },
    { key: 'Content Posts', value: '' },
  ]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [existingContent, setExistingContent] = useState<string | null>(null);

  // Check if a check-in already exists for today
  useEffect(() => {
    fetch(`/api/checkin?date=${date}`)
      .then(r => r.json())
      .then(d => {
        if (d.exists) setExistingContent(d.content);
        else setExistingContent(null);
      })
      .catch(() => {});
  }, [date]);

  function updatePriority(i: number, val: string) {
    setPriorities(p => p.map((v, idx) => idx === i ? val : v));
  }

  function updateNumber(i: number, field: 'key' | 'value', val: string) {
    setNumbers(n => n.map((row, idx) => idx === i ? { ...row, [field]: val } : row));
  }

  function addNumber() {
    setNumbers(n => [...n, { key: '', value: '' }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const filledPriorities = priorities.filter(Boolean);
    if (!filledPriorities.length) {
      setSubmitting(false);
      return;
    }

    const numbersObj: Record<string, string> = {};
    for (const { key, value } of numbers) {
      if (key && value) numbersObj[key] = value;
    }

    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        priorities: filledPriorities,
        blocker: blocker || undefined,
        numbers: Object.keys(numbersObj).length ? numbersObj : undefined,
        notes: notes || undefined,
      }),
    });

    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push('/'), 1200);
    } else {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
        <div className="forge-heading text-2xl text-brand-ink">Check-in saved</div>
        <p className="text-xs font-mono text-brand-medium-gray uppercase tracking-widest">Redirecting to Mission Control…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* Header */}
      <header className="flex items-center gap-4 border-b border-brand-warm-gray pb-6">
        <Link href="/" className="text-brand-medium-gray hover:text-brand-ink transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="forge-heading text-3xl">Daily <span className="text-brand-gold">Check-in</span></h1>
          <p className="text-brand-medium-gray font-mono text-xs uppercase tracking-[0.25em] mt-0.5">{dateLabel}</p>
        </div>
        {existingContent && (
          <span className="ml-auto flex items-center gap-1.5 text-[9px] font-mono font-bold text-amber-600 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            Overwriting existing
          </span>
        )}
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Date */}
        <div>
          <label className="forge-label block mb-2">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="forge-input font-mono text-sm"
          />
        </div>

        {/* Priorities */}
        <div className="forge-panel">
          <div className="forge-label mb-4">
            First Move Tomorrow
            <span className="ml-2 text-[8px] font-mono text-brand-medium-gray normal-case tracking-normal">What are the 3 things that matter most?</span>
          </div>
          <div className="space-y-3">
            {priorities.map((p, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-[10px] font-mono font-bold text-brand-gold w-4 shrink-0 pt-3">{i + 1}.</span>
                <input
                  type="text"
                  value={p}
                  onChange={e => updatePriority(i, e.target.value)}
                  placeholder={`Priority ${i + 1}`}
                  className="forge-input flex-1 text-sm"
                  required={i === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Blocker */}
        <div className="forge-panel">
          <div className="forge-label mb-3">
            Blocker / Unfinished
            <span className="ml-2 text-[8px] font-mono text-brand-medium-gray normal-case tracking-normal">Optional</span>
          </div>
          <input
            type="text"
            value={blocker}
            onChange={e => setBlocker(e.target.value)}
            placeholder="What's blocking you or unfinished from today?"
            className="forge-input w-full text-sm"
          />
        </div>

        {/* Numbers */}
        <div className="forge-panel">
          <div className="forge-label mb-4">
            Numbers / Updates
            <span className="ml-2 text-[8px] font-mono text-brand-medium-gray normal-case tracking-normal">Optional KPIs</span>
          </div>
          <div className="space-y-2">
            {numbers.map((row, i) => (
              <div key={i} className="grid grid-cols-5 gap-2">
                <input
                  type="text"
                  value={row.key}
                  onChange={e => updateNumber(i, 'key', e.target.value)}
                  placeholder="Metric"
                  className="forge-input col-span-2 text-xs font-mono"
                />
                <input
                  type="text"
                  value={row.value}
                  onChange={e => updateNumber(i, 'value', e.target.value)}
                  placeholder="Value"
                  className="forge-input col-span-3 text-xs"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addNumber}
            className="mt-3 text-[9px] font-mono font-bold text-brand-gold uppercase tracking-widest hover:text-brand-ink transition-colors"
          >
            + Add metric
          </button>
        </div>

        {/* Notes */}
        <div className="forge-panel">
          <div className="forge-label mb-3">
            Notes
            <span className="ml-2 text-[8px] font-mono text-brand-medium-gray normal-case tracking-normal">Optional</span>
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any additional notes…"
            rows={3}
            className="forge-input w-full text-sm resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={submitting || !priorities[0]}
            className="flex items-center gap-2 bg-brand-gold text-white text-[9px] font-mono font-bold uppercase tracking-widest px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
            Save Check-in
          </button>
          <Link href="/" className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest hover:text-brand-ink transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
