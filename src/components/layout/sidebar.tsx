"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ForgeLogo from '../ForgeLogo';

const navItems = [
  { name: 'Mission Control', path: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Agent HQ', path: '/office', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { name: 'Agents', path: '/agents', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { name: 'Revenue', path: '/revenue', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 010 18z' },
  { name: 'Tools', path: '/tools', icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid var(--color-brand-warm-gray)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
    }}>
      <div style={{ padding: '2rem' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <ForgeLogo className="w-10 h-10" />
          <div>
            <div className="forge-heading" style={{ fontSize: '1.1rem' }}>Forge OS</div>
            <div style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: 'var(--color-brand-medium-gray)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Executive Terminal</div>
          </div>
        </div>

        {/* Nav */}
        <nav>
          <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--color-brand-medium-gray)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '1rem', marginLeft: '0.5rem' }}>
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.25rem',
                  marginBottom: '0.25rem',
                  position: 'relative',
                  color: isActive ? 'var(--color-brand-ink)' : 'var(--color-brand-medium-gray)',
                  backgroundColor: isActive ? 'var(--color-brand-parchment)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  borderLeft: isActive ? '2px solid var(--color-brand-gold)' : '2px solid transparent',
                }}
              >
                <svg style={{ width: '1.1rem', height: '1.1rem', color: isActive ? 'var(--color-brand-gold)' : 'inherit', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontStyle: isActive ? 'italic' : 'normal' }}>
                  {item.name}
                </span>
                {isActive && (
                  <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-brand-gold)' }} />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid var(--color-brand-warm-gray)', backgroundColor: 'var(--color-brand-parchment)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ width: '2rem', height: '2rem', borderRadius: '0.25rem', backgroundColor: 'var(--color-brand-ivory)', border: '1px solid var(--color-brand-warm-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: 'var(--color-brand-ink)', fontStyle: 'italic' }}>
            DV
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--color-brand-ink)', textTransform: 'uppercase' }}>Devroux</div>
            <div style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active Session</div>
          </div>
        </div>
        <div style={{ height: '3px', width: '100%', backgroundColor: 'var(--color-brand-warm-gray)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '75%', backgroundColor: 'var(--color-brand-gold)' }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.5rem', fontFamily: 'monospace', color: 'var(--color-brand-medium-gray)', textTransform: 'uppercase' }}>
          <span>Core Load</span><span>75%</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
