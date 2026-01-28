// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // ← This makes Tailwind’s `font-sans` use Space Grotesk
        sans: ['var(--font-space-grotesk)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        'ww-violet': '#6D28D9',
        'ww-bg': '#0A0A0A',
        'ww-text': '#FAFAFA',
      },
      borderRadius: {
        pill: '9999px',
      },
    },
  },
  plugins: [],
}
export default config



