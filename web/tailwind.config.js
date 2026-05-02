/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
        'totem': { 'raw': '(min-height: 1920px) and (orientation: portrait)' },
        'tablet': { 'raw': '(min-width: 768px) and (orientation: landscape)' },
        'landscape': { 'raw': '(orientation: landscape)' },
        'portrait': { 'raw': '(orientation: portrait)' },
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      minHeight: {
        'screen-90': '90vh',
        'screen-80': '80vh',
        'screen-70': '70vh',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  plugins: [],
}
