import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', '"IBM Plex Sans KR"', 'sans-serif'],
        display: ['"Cinzel"', 'serif'],
        korean: ['"IBM Plex Sans KR"', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#fff0f0',
          100: '#ffd9d9',
          400: '#e03030',
          500: '#cc1a1a',
          600: '#991414',
          700: '#7a0f0f',
          800: '#4A0404',
          900: '#2a0303',
        },
        gold: {
          300: '#E8D48B',
          400: '#C9A84C',
          500: '#B8860B',
          600: '#8B6508',
        },
        surface: {
          50:  '#1e1218',
          100: '#160d12',
          200: '#110a0e',
          900: '#0d0d14',
        },
      },
    },
  },
  plugins: [],
};

export default config;
