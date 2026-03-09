/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // VNIT Blue — primary brand accent
        'vnit-blue': {
          DEFAULT: '#1A56DB',
          light:   '#3B82F6',
          dark:    '#1E3A8A',
          glow:    '#60A5FA',
        },
        // Gold accent matching club logo
        'vnit-gold': {
          DEFAULT: '#EAB308', // yellow-500
          light:   '#FDE047', // yellow-300
          dark:    '#CA8A04', // yellow-600
        },
      },
      fontFamily: {
        sans:  ['Inter', 'ui-sans-serif', 'system-ui'],
        mono:  ['JetBrains Mono', 'monospace'],
        chess: ['"MedievalSharp"', 'serif'],
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse at 60% 40%, rgba(26,86,219,0.25) 0%, rgba(234,179,8,0.08) 50%, transparent 75%)',
        'card-gradient': 'linear-gradient(135deg, rgba(30,58,138,0.15) 0%, rgba(15,23,42,0.8) 100%)',
      },
      boxShadow: {
        'blue-glow':  '0 0 24px 4px rgba(26,86,219,0.45)',
        'gold-glow':  '0 0 20px 3px rgba(234,179,8,0.35)',
        'card-hover': '0 8px 32px rgba(26,86,219,0.3)',
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
