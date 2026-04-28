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
        'totem': { 'raw': '(min-height: 1920px) and (orientation: portrait)' },
        'tablet': { 'raw': '(min-width: 768px) and (orientation: landscape)' },
      },
    },
  },
  plugins: [],
}
