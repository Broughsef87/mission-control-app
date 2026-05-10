import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ab-base':          '#05070C',
        'ab-surface':       '#0A0D14',
        'ab-surface-2':     '#0F1520',
        'ab-border':        '#1A2130',
        'ab-border-bright': '#2A3545',
        'ab-red':           '#DC2626',
        'ab-red-hover':     '#B91C1C',
        'ab-gold':          '#E8A320',
        'ab-green':         '#28CD41',
        'ab-blue':          '#1E6FFF',
        'ab-text':          '#EAEAEA',
        'ab-body':          '#B8C0CC',
        'ab-muted':         '#6A7888',
        // Legacy fallbacks mapped to AB Design System to fix broken UI
        'brand-parchment':   '#0A0D14',
        'brand-ivory':       '#0F1520',
        'brand-warm-gray':   '#1A2130',
        'brand-medium-gray': '#6A7888',
        'brand-slate':       '#B8C0CC',
        'brand-charcoal':    '#EAEAEA',
        'brand-ink':         '#EAEAEA',
        'brand-gold':        '#E8A320',
        'brand-gold-light':  '#F5C040',
      },
      borderColor: {
        DEFAULT: '#1A2130', // Ensure bare 'border' class defaults to ab-border
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['Courier New', 'Courier', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'xs': '2px',
        'sm': '0.125rem',
        'md': '0.375rem',
        'lg': '0.5rem',
      },
    },
  },
};

export default config;
