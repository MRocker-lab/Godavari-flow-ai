/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '"Noto Sans Telugu"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Noto Sans Telugu"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        pilgrim: {
          bg: '#FAF8F5',
          surface: '#FFFFFF',
          subtle: '#F3EFEA',
          border: '#E5DFD5',
          primary: '#1E3A8A',
          primaryHover: '#172554',
          teal: '#0D9488',
          cyan: '#0891B2',
          saffron: '#D97706',
          saffronLight: '#FEF3C7',
          navy: '#0F172A',
          muted: '#475569',
        },
        command: {
          bg: '#070D19',
          panel: '#0F172A',
          elevated: '#1E293B',
          border: '#334155',
          cyan: '#06B6D4',
          cyanMuted: '#164E63',
          text: '#F8FAFC',
          muted: '#94A3B8',
          critical: '#EF4444',
          warning: '#F59E0B',
          normal: '#10B981',
        },
      },
      boxShadow: {
        'pilgrim-card': '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'pilgrim-hover': '0 12px 28px -4px rgba(30, 58, 138, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.05)',
        'command-panel': '0 4px 24px -2px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};

