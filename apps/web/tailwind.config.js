/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fb',
          400: '#36aaf5',
          500: '#0c8fe2',
          600: '#0070c0',
          700: '#005899',
          800: '#044a7e',
          900: '#0a3f6a',
          950: '#072848',
        },
        accent: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6c0e',
        },
        surface: {
          950: '#050c15',
          900: '#0a1628',
          800: '#0f2040',
          700: '#162d56',
          600: '#1e3a6a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #050c15 0%, #0a1628 40%, #0f2040 70%, #162d56 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(15,32,64,0.8) 0%, rgba(22,45,86,0.6) 100%)',
        'accent-gradient': 'linear-gradient(135deg, #f97316, #ea580c)',
        'brand-gradient': 'linear-gradient(135deg, #0c8fe2, #005899)',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
        '108': '1.08',
        '112': '1.12',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-fast': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-up-fast': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'zoom-in': 'zoomIn 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
};
