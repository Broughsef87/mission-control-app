"use client";

import React from 'react';

type RecordState = 'idle' | 'recording' | 'submitting' | 'success' | 'error';

const MAX_SECONDS = 90;

export default function BrainDumpButton() {
  const [state, setState] = React.useState<RecordState>('idle');
  const [elapsed, setElapsed] = React.useState(0);
  const [errorMsg, setErrorMsg] = React.useState('');

  const mediaRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = React.useRef(0);
  const isStartingRef = React.useRef(false);  // guard against double-click during getUserMedia
  const shouldSubmitRef = React.useRef(true);  // false when stopping due to unmount/navigation

  function clearTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  // Release mic and timer if user navigates away mid-recording — but don't upload partial audio
  React.useEffect(() => {
    return () => {
      clearTimer();
      shouldSubmitRef.current = false;
      if (mediaRef.current && mediaRef.current.state !== 'inactive') {
        mediaRef.current.stop();
      }
    };
  }, []);

  async function startRecording() {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    elapsedRef.current = 0;
    shouldSubmitRef.current = true;
    setElapsed(0);
    setErrorMsg('');
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream!.getTracks().forEach(t => t.stop());
        if (!shouldSubmitRef.current) return;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        submitDump(blob, recorder.mimeType);
      };
      recorder.start(250);
      mediaRef.current = recorder;
      setState('recording');

      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
        if (elapsedRef.current >= MAX_SECONDS) stopRecording();
      }, 1000);
    } catch (err: any) {
      // Stop any tracks acquired before the MediaRecorder constructor threw
      stream?.getTracks().forEach(t => t.stop());
      setErrorMsg(err.message ?? 'Microphone access denied');
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    } finally {
      isStartingRef.current = false;
    }
  }

  function stopRecording() {
    clearTimer();
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop();
      setState('submitting');
    }
  }

  async function submitDump(blob: Blob, mimeType: string) {
    setState('submitting');
    try {
      const form = new FormData();
      const ext = mimeType.includes('webm') ? 'webm' : mimeType.includes('ogg') ? 'ogg' : 'mp3';
      form.append('audio', blob, `dump.${ext}`);
      const res = await fetch('/api/morning-desk/dump', { method: 'POST', body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setState('success');
      setTimeout(() => setState('idle'), 2500);
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Upload failed');
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  }

  function handleToggle() {
    if (state === 'idle') startRecording();
    else if (state === 'recording') stopRecording();
  }

  const remaining = MAX_SECONDS - elapsed;

  if (state === 'idle') {
    return (
      <button
        onClick={handleToggle}
        style={{
          fontFamily: 'var(--ab-font-mono)',
          fontSize: '8px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          padding: '0.3rem 0.625rem',
          borderRadius: '4px',
          border: '1px solid var(--ab-gold)',
          color: 'var(--ab-gold)',
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255, 215, 0, 0.1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        title="Record a brain dump"
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ab-gold)' }} />
        Brain Dump
      </button>
    );
  }

  if (state === 'recording') {
    return (
      <button
        onClick={handleToggle}
        style={{
          fontFamily: 'var(--ab-font-mono)',
          fontSize: '8px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          padding: '0.3rem 0.625rem',
          borderRadius: '4px',
          border: '1px solid var(--ab-red)',
          color: 'var(--ab-red)',
          background: 'rgba(220,38,38,0.06)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
        }}
        title="Click to stop recording"
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ab-red)', animation: 'pulse-glow 0.8s ease-in-out infinite' }} />
        {remaining}s · stop
      </button>
    );
  }

  if (state === 'submitting') {
    return (
      <div style={{
        fontFamily: 'var(--ab-font-mono)',
        fontSize: '8px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        padding: '0.3rem 0.625rem',
        borderRadius: '4px',
        border: '1px solid var(--ab-border)',
        color: 'var(--ab-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
      }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ab-gold)', animation: 'pulse-glow 0.6s ease-in-out infinite' }} />
        transcribing...
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div style={{
        fontFamily: 'var(--ab-font-mono)',
        fontSize: '8px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        padding: '0.3rem 0.625rem',
        borderRadius: '4px',
        border: '1px solid rgba(40,205,65,0.4)',
        color: 'var(--ab-green)',
        background: 'rgba(40,205,65,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
      }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ab-green)' }} />
        saved
      </div>
    );
  }

  // error
  return (
    <div style={{
      fontFamily: 'var(--ab-font-mono)',
      fontSize: '8px',
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      padding: '0.3rem 0.625rem',
      borderRadius: '4px',
      border: '1px solid rgba(220,38,38,0.4)',
      color: 'var(--ab-red)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
      maxWidth: '200px',
    }}
    title={errorMsg}
    >
      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--ab-red)' }} />
      <span className="truncate">{errorMsg || 'error'}</span>
    </div>
  );
}
