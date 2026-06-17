/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1B5E96',
        primaryDark: '#144A78',
        secondary: '#F0F7FF',
        surface: '#FAFCFF',
        text: '#1A1A1A',
        textSecondary: '#4A4A4A',
        textMuted: '#999999',
        border: '#E0E0E0',
        borderLight: '#F0F0F0',
        brand: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          200: '#B8D9F5',
          500: '#1B5E96',
          600: '#144A78',
          700: '#0F3A5C',
          900: '#0A2540',
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        accent: {
          DEFAULT: '#6366F1',
          light: '#818CF8',
          violet: '#7C3AED',
        },
        severity: {
          none: '#10B981',
          low: '#0EA5E9',
          moderate: '#F59E0B',
          high: '#EF4444',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 2px 16px rgba(27, 94, 150, 0.06)',
        card: '0 4px 24px rgba(15, 42, 74, 0.08)',
        elevated: '0 12px 40px rgba(15, 42, 74, 0.12)',
        glow: '0 0 0 1px rgba(27, 94, 150, 0.08), 0 8px 32px rgba(20, 74, 120, 0.15)',
        'glow-teal': '0 0 0 1px rgba(20, 184, 166, 0.2), 0 8px 32px rgba(13, 148, 136, 0.15)',
      },
      backgroundImage: {
        'mesh-light':
          'radial-gradient(ellipse 80% 60% at 10% 0%, rgba(27,94,150,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 10%, rgba(20,184,166,0.06) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 50% 100%, rgba(99,102,241,0.05) 0%, transparent 50%)',
        'hero-gradient': 'linear-gradient(135deg, #1B5E96 0%, #0D9488 50%, #6366F1 100%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,247,255,0.6) 100%)',
      },
      animation: {
        'scan-sweep': 'scanSweep 2.5s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2s ease-out infinite',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
      },
      keyframes: {
        scanSweep: {
          '0%, 100%': { transform: 'translateY(-100%)', opacity: '0' },
          '40%, 60%': { opacity: '1' },
          '100%': { transform: 'translateY(200%)', opacity: '0' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '0.4' },
          '100%': { transform: 'scale(0.95)', opacity: '0.8' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(2deg)' },
        },
      },
      screens: {
        xs: '480px',
        totem: { raw: '(min-height: 1920px) and (orientation: portrait)' },
        tablet: { raw: '(min-width: 768px) and (orientation: landscape)' },
      },
    },
  },
  plugins: [],
};
