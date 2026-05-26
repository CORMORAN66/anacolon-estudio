import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'] as ['class', string],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#C9A96E',
        'off-white': '#F9F7F4',
        ink: '#1A1A1A',
        muted: '#888888',
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1.05', fontWeight: '700' }],
        'hero': ['clamp(1.25rem, 2.5vw, 1.75rem)', { lineHeight: '1.4' }],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
