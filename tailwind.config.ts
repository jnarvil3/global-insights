import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ocean: '#0a1128',
        land: '#1a1f2e',
        beam: {
          politics: '#4ecdc4',
          conflict: '#ff6b6b',
          environment: '#95e1d3',
          tech: '#f9ca24',
          health: '#6c5ce7',
          economy: '#fd79a8',
        },
        glow: '#00d9ff',
        cityLight: '#ffb347',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
export default config
