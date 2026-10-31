/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          blush: '#FFDBDF',
          rose: '#F791A9',
          yellow: '#FFE797',
          lime: '#DDDD7B',
          cyan: '#E0F2F4',
          blue: '#BAD6DA',
        },
        guard: {
          navy: '#18243A',
          midnight: '#0D1424',
          slate: '#263348',
          softbg: '#FFF9FA',
          card: '#FFFFFF',
          border: '#E8ECF2',
          muted: '#64748B',
        },
        detect: {
          real: '#2E8B70',
          'real-bg': '#EAF6F2',
          'real-border': '#A3D9C9',
          fake: '#D94F70',
          'fake-bg': '#FDF0F3',
          'fake-border': '#F5A9B8',
          warning: '#C58B2B',
          'warning-bg': '#FEF9EE',
          'warning-border': '#F5DCA3',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(24, 36, 58, 0.06), 0 2px 6px -1px rgba(24, 36, 58, 0.04)',
        'soft-lg': '0 12px 36px -4px rgba(24, 36, 58, 0.08), 0 4px 12px -2px rgba(24, 36, 58, 0.03)',
        'soft-xl': '0 24px 60px -12px rgba(24, 36, 58, 0.12), 0 8px 24px -4px rgba(24, 36, 58, 0.04)',
        'glass': '0 8px 32px 0 rgba(24, 36, 58, 0.06)',
      },
      animation: {
        'scan': 'scan 3s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.75 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
