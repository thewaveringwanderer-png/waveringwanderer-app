import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ww: {
          black: '#000000',
          dark: '#0B0B0F',
          white: '#FFFFFF',
          violet: '#9B30FF',
          deep: '#6A0DAD',
          soft: '#C084FC',
          emerald: '#10B981',
          blue: '#3B82F6',
          amber: '#F59E0B',
        },

        'ww-bg': '#0A0A0A',
        'ww-text': '#FAFAFA',
        'ww-violet': '#9B30FF',
        'ww-emerald': '#10B981',
        'ww-blue': '#3B82F6',
        'ww-amber': '#F59E0B',
        'ww-dark': '#0B0B0F',
        'ww-soft-violet': '#C084FC',
        'ww-deep-violet': '#6A0DAD',
      },
      borderRadius: {
        pill: '9999px',
      },
      keyframes: {
        'ww-pulse': {
          '0%, 100%': { opacity: '0.65', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
      },
      animation: {
        'ww-pulse': 'ww-pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config