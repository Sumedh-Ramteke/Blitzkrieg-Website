/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark surface — replaces former blue; keeps all vnit-blue class names working
        'vnit-blue': {
          DEFAULT: '#1C1A16',   // very dark warm charcoal (surface)
          light:   '#2D2922',   // slightly lighter dark
          dark:    '#0D0B08',   // near-black
          glow:    '#C9A84C',   // gold — any "glow" text/accent is now gold
        },
        // Antique gold — the ONLY accent colour, matching the club logo
        'vnit-gold': {
          DEFAULT: '#C9A84C',   // warm antique gold
          light:   '#E8C96D',   // bright gold highlight
          dark:    '#8B6A14',   // deep burnished gold
        },
      },
      fontFamily: {
        sans:  ['Inter', 'ui-sans-serif', 'system-ui'],
        mono:  ['JetBrains Mono', 'monospace'],
        chess: ['"MedievalSharp"', 'serif'],
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse at 60% 40%, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 50%, transparent 75%)',
        'card-gradient': 'linear-gradient(135deg, rgba(28,26,22,0.4) 0%, rgba(13,11,8,0.95) 100%)',
      },
      boxShadow: {
        'blue-glow':  '0 0 24px 4px rgba(201,168,76,0.25)',
        'gold-glow':  '0 0 20px 3px rgba(201,168,76,0.45)',
        'card-hover': '0 8px 32px rgba(201,168,76,0.2)',
      },
      animation: {
        'float':     'float 6s ease-in-out infinite',
        'pulse-glow':'pulse-glow 2.5s ease-in-out infinite',
        'fade-in':   'fadeIn 0.6s ease-out forwards',
        'slide-up':  'slideUp 0.7s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-16px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
