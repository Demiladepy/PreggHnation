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
        bloom: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        sage: {
          50: '#f6f7f6',
          100: '#e3e7e2',
          200: '#c6cfc4',
          300: '#a2b09f',
          400: '#7d8f79',
          500: '#62745e',
          600: '#4d5c4a',
          700: '#404b3d',
          800: '#363f34',
          900: '#2f362d',
        },
      },
    },
  },
  plugins: [],
}
export default config
