import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Sidebar from "@/components/layout/sidebar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Foundry — Forge OS",
  description: "Forge OS internal operations dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}
        style={{ background: 'var(--ab-base)', color: 'var(--ab-text)' }}>

        {/* Ambient: amber grid — fades from top */}
        <div className="fixed inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(232,163,32,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(232,163,32,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at top, #000 0%, transparent 70%)',
          zIndex: 0,
        }} />

        {/* Ambient: CRT scan lines */}
        <div className="fixed inset-0 pointer-events-none" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          zIndex: 1,
        }} />

        {/* Ambient: red spotlight above hero */}
        <div className="fixed pointer-events-none" style={{
          top: '-200px', left: '50%', transform: 'translateX(-50%)',
          width: '900px', height: '600px',
          background: 'radial-gradient(ellipse, rgba(220,38,38,0.06) 0%, transparent 60%)',
          zIndex: 1,
        }} />

        {/* Left rail */}
        <div className="fixed top-0 bottom-0 left-0 w-8 hidden lg:flex flex-col items-center justify-center gap-3 pointer-events-none" style={{ zIndex: 50, borderRight: '1px solid var(--ab-border)' }}>
          <div className="flex-1 w-px" style={{ background: 'linear-gradient(to bottom, transparent, var(--ab-border) 20%, var(--ab-border) 80%, transparent)' }} />
          <div className="w-1 h-1 rounded-full" style={{ background: 'var(--ab-border-bright)' }} />
          <span style={{ fontFamily: 'var(--ab-font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ab-muted)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>FORGE-OS · 2026</span>
          <div className="w-1 h-1 rounded-full" style={{ background: 'var(--ab-border-bright)' }} />
          <span style={{ fontFamily: 'var(--ab-font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ab-muted)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>BUILD IN PUBLIC</span>
          <div className="w-1 h-1 rounded-full" style={{ background: 'var(--ab-border-bright)' }} />
          <div className="flex-1 w-px" style={{ background: 'linear-gradient(to bottom, transparent, var(--ab-border) 20%, var(--ab-border) 80%, transparent)' }} />
        </div>

        {/* Right rail */}
        <div className="fixed top-0 bottom-0 right-0 w-8 hidden lg:flex flex-col items-center justify-center gap-3 pointer-events-none" style={{ zIndex: 50, borderLeft: '1px solid var(--ab-border)' }}>
          <div className="flex-1 w-px" style={{ background: 'linear-gradient(to bottom, transparent, var(--ab-border) 20%, var(--ab-border) 80%, transparent)' }} />
          <div className="w-1 h-1 rounded-full" style={{ background: 'var(--ab-border-bright)' }} />
          <span style={{ fontFamily: 'var(--ab-font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ab-muted)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>The Foundry</span>
          <div className="w-1 h-1 rounded-full" style={{ background: 'var(--ab-border-bright)' }} />
          <span style={{ fontFamily: 'var(--ab-font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ab-muted)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>v3.0 · OPENCLAW</span>
          <div className="w-1 h-1 rounded-full" style={{ background: 'var(--ab-border-bright)' }} />
          <div className="flex-1 w-px" style={{ background: 'linear-gradient(to bottom, transparent, var(--ab-border) 20%, var(--ab-border) 80%, transparent)' }} />
        </div>

        {/* App shell */}
        <div style={{ display: 'flex', height: '100vh', width: '100%', position: 'relative', zIndex: 2 }}>
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Telemetry ticker */}
            <div style={{
              height: '28px',
              overflow: 'hidden',
              borderBottom: '1px solid var(--ab-border)',
              background: 'rgba(5,7,12,0.95)',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}>
              <div style={{
                display: 'flex',
                gap: '4rem',
                whiteSpace: 'nowrap',
                animation: 'ticker 28s linear infinite',
                fontFamily: 'var(--ab-font-mono)',
                fontSize: '10px',
                letterSpacing: '0.12em',
                color: 'var(--ab-muted)',
                paddingLeft: '4rem',
              }}>
                {[0, 1].map(i => (
                  <span key={i} style={{ display: 'flex', gap: '4rem' }}>
                    <span style={{ color: 'var(--ab-red)' }}>SYS: ONLINE</span>
                    <span>FORGE AGENCY — ACTIVE</span>
                    <span>DAD STRENGTH — ACTIVE</span>
                    <span>The Foundry v3.0</span>
                    <span style={{ color: 'var(--ab-gold)' }}>OPENCLAW · COLORADO, USA</span>
                    <span>BUILD IN PUBLIC</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Main content */}
            <main style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem' }}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
