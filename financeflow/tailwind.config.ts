import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fb',
          400: '#36acf7',
          500: '#0c91eb',
          600: '#0074ca',
          700: '#005da3',
          800: '#004f87',
          900: '#064270',
        },
        surface: '#f8fafc',
      },
    },
  },
  plugins: [],
};

export default config;
