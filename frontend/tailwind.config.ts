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
        cream: {
          50: '#FEFCF9',
          100: '#FAF8F3',
          200: '#F5F1E8',
          300: '#EDE5D5',
          400: '#E0D4BC',
        },
        sage: {
          50: '#F0F7ED',
          100: '#E1EFDB',
          200: '#C4DFB7',
          300: '#7FB069',
          400: '#5A8A4A',
          500: '#4A7340',
          600: '#3D5F35',
        },
        peach: {
          50: '#FEF5F2',
          100: '#FDE8E0',
          200: '#FBD1C0',
          300: '#F4A88A',
          400: '#E8B5A0',
          500: '#D99B82',
        },
        earth: {
          50: '#F5F3F0',
          100: '#E8E3DB',
          200: '#D4CCC0',
          300: '#8B7D6B',
          400: '#6B5F52',
          500: '#4A4238',
          600: '#3D3630',
          700: '#2C2C2C',
        },
        bloom: {
          50: '#F0F7ED',
          100: '#E1EFDB',
          200: '#C4DFB7',
          300: '#7FB069',
          400: '#5A8A4A',
          500: '#4A7340',
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'large': '0 8px 24px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
export default config
