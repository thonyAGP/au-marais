import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF8F5',
        stone: {
          100: '#F5F3EF',
          200: '#E8E4DD',
          400: '#A39E93',
          600: '#6B665C',
          800: '#3D3A35',
          900: '#1F1D1A',
        },
        gold: {
          DEFAULT: '#C9A962',
          dark: '#A68B4B',
        },
        available: '#4A7C59',
        unavailable: '#9B3D3D',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
