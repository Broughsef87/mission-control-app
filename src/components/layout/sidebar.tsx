"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import ForgeLogo from '../ForgeLogo';
import {
  LayoutDashboard, Building2, Users, DollarSign,
  Wrench, FileVideo, Settings, ChevronLeft, ChevronRight, LogOut, Briefcase
} from 'lucide-react';

const navItems = [
  { name: 'Mission Control', path: '/',        icon: LayoutDashboard },
  { name: 'Agent HQ',        path: '/office',   icon: Building2       },
  { name: 'Agents',          path: '/agents',   icon: Users           },
  { name: 'Revenue',         path: '/revenue',  icon: DollarSign      },
  { name: 'Projects',        path: '/projects', icon: Briefcase       },
  { name: 'Agency CRM',      path: '/crm',      icon: Users           },
  { name: 'Content',         path: '/content',  icon: FileVideo       },
  { name: 'Tools',           path: '/tools',    icon: Wrench          },
  { name: 'Settings',        path: '/settings', icon: Settings        },
];

// ── Design tokens (dark industrial)
const T = {
  base:          '#111210',
  surface:       '#1A1917',
  surface2:      '#232119',
  surface3:      '#2C2A26',
  border:        '#302E2A',
  border2:       '#3E3C38',
  borderChrome:  '#5A5850',
  chrome:        '#B8B4AC',
  chrome2:       '#D4D0C8',
  chromeMuted:   '#7A7870',
  text:          '#E8E4DC',
  text2:         '#A8A49C',
  textMuted:     '#6A6860',
  green:         '#6A9A78',
  amber:         '#B09A6A',
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  }

  async function handleLogout() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const sb = createClient(url, key);
      await sb.auth.signOut();
    }
    router.push('/login');
    router.refresh();
  }

  const w = collapsed ? '72px' : '260px';

  return (
    <aside style={{
      width: w,
      minWidth: w,
      backgroundColor: T.surface,
      borderRight: `1px solid ${T.border}`,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
      boxShadow: `2px 0 24px rgba(0,0,0,0.5)`,
      transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      overflow: 'hidden',
    }}>

      {/* Logo + Toggle */}
      <div style={{
        padding: collapsed ? '1.25rem 1rem' : '1.5rem 1.5rem 1rem',
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
            <ForgeLogo className="w-8 h-8 shrink-0" />
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div className="forge-heading" style={{ fontSize: '1rem', whiteSpace: 'nowrap', color: T.text }}>Forge OS</div>
                <div style={{ fontSize: '0.5rem', fontFamily: 'var(--font-mono)', color: T.chromeMuted, textTransform: 'uppercase', letterSpacing: '0.2em', whiteSpace: 'nowrap' }}>
                  Executive Terminal
                </div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={toggleCollapsed}
              style={{ padding: '0.25rem', borderRadius: '0.375rem', border: `1px solid ${T.border2}`, color: T.chromeMuted, cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center' }}
            >
              <ChevronLeft style={{ width: '0.875rem', height: '0.875rem' }} />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={toggleCollapsed}
            style={{ marginTop: '0.75rem', width: '100%', padding: '0.25rem', borderRadius: '0.375rem', border: `1px solid ${T.border2}`, color: T.chromeMuted, cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronRight style={{ width: '0.875rem', height: '0.875rem' }} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ padding: collapsed ? '0.75rem 0.5rem' : '1rem 0.75rem', flex: 1, overflowY: 'auto' }}>
        {!collapsed && (
          <div style={{ fontSize: '0.45rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '0.75rem', marginLeft: '0.5rem', fontFamily: 'var(--font-mono)' }}>
            Navigation
          </div>
        )}
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              title={collapsed ? item.name : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: '0.625rem',
                padding: collapsed ? '0.625rem' : '0.5rem 0.875rem',
                borderRadius: '0.5rem',
                marginBottom: '0.125rem',
                color: isActive ? T.chrome2 : T.text2,
                backgroundColor: isActive ? T.surface3 : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                borderLeft: !collapsed && isActive ? `2px solid ${T.chrome}` : '2px solid transparent',
              }}
            >
              <Icon style={{ width: '1rem', height: '1rem', color: isActive ? T.chrome : T.chromeMuted, flexShrink: 0 }} />
              {!collapsed && (
                <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontStyle: isActive ? 'italic' : 'normal', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                  {item.name}
                </span>
              )}
              {!collapsed && isActive && (
                <div style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: T.chrome }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: collapsed ? '0.75rem 0.5rem' : '1rem 0.75rem', borderTop: `1px solid ${T.border}`, backgroundColor: T.base }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '2rem', height: '2rem', borderRadius: '0.375rem',
              backgroundColor: T.surface3, border: `1px solid ${T.borderChrome}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.55rem', fontWeight: 700, color: T.chrome2,
              fontStyle: 'italic', fontFamily: 'var(--font-mono)', flexShrink: 0,
            }}>
              DV
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: T.text, textTransform: 'uppercase', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>Devroux</div>
              <div style={{ fontSize: '0.5rem', fontFamily: 'var(--font-mono)', color: T.green, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Active Session</div>
            </div>
          </div>
        )}

        {!collapsed && (
          <div style={{ marginBottom: '0.625rem' }}>
            <div style={{ height: '2px', width: '100%', backgroundColor: T.border2, borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '75%', background: `linear-gradient(90deg, ${T.borderChrome}, ${T.chrome})` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontSize: '0.45rem', fontFamily: 'var(--font-mono)', color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <span>Core Load</span><span>75%</span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '0.5rem',
            padding: collapsed ? '0.5rem' : '0.5rem 0.75rem',
            borderRadius: '0.375rem',
            border: `1px solid ${T.border2}`,
            background: 'transparent',
            color: T.textMuted,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            fontSize: '0.55rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: 'var(--font-mono)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#A86058'; (e.currentTarget as HTMLElement).style.borderColor = '#8A4A42'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textMuted; (e.currentTarget as HTMLElement).style.borderColor = T.border2; }}
        >
          <LogOut style={{ width: '0.75rem', height: '0.75rem', flexShrink: 0 }} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
