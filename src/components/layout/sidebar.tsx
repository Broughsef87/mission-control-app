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

// ── Design tokens (Forge OS light)
const T = {
  base:          '#F2EFEA',
  surface:       '#FAFAF8',
  surface2:      '#F5F2EE',
  surface3:      '#EDE9E4',
  border:        '#E4E0DA',
  border2:       '#D8D4CE',
  borderChrome:  '#C8C4BE',
  chrome:        '#9B9894',
  chrome2:       '#6B6862',
  chromeMuted:   '#B8B4AE',
  text:          '#1A1917',
  text2:         '#6B6862',
  textMuted:     '#9B9894',
  accent:        '#E07A5F',
  green:         '#3D7A52',
  amber:         '#9A7A30',
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
      boxShadow: `1px 0 0 ${T.border}`,
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
                color: isActive ? T.text : T.text2,
                backgroundColor: isActive ? T.surface3 : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                borderLeft: !collapsed && isActive ? `2px solid ${T.accent}` : '2px solid transparent',
              }}
            >
              <Icon style={{ width: '1rem', height: '1rem', color: isActive ? T.accent : T.chromeMuted, flexShrink: 0 }} />
              {!collapsed && (
                <span style={{ fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                  {item.name}
                </span>
              )}
              {!collapsed && isActive && (
                <div style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: T.accent }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: collapsed ? '0.75rem 0.5rem' : '1rem 0.75rem', borderTop: `1px solid ${T.border}`, backgroundColor: T.surface2 }}>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '0.5rem',
            padding: collapsed ? '0.5rem' : '0.5rem 0.875rem',
            borderRadius: '9999px',
            border: `1px solid ${T.border2}`,
            background: 'transparent',
            color: T.textMuted,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            fontSize: '0.6rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: 'var(--font-mono)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.accent; (e.currentTarget as HTMLElement).style.borderColor = T.accent; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textMuted; (e.currentTarget as HTMLElement).style.borderColor = T.border2; }}
        >
          <LogOut style={{ width: '0.75rem', height: '0.75rem', flexShrink: 0 }} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
