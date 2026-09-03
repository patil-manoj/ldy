/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          light: '#3b82f6',
          dark: '#1d4ed8',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        accent: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        },
        warm: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
        },
      },
      fontFamily: {
        heading: ['"Inter"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #172554 0%, #1e3a8a 50%, #1d4ed8 100%)',
        'section-light': 'linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)',
        'section-blue': 'linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)',
        'cta-gradient': 'linear-gradient(135deg, #172554 0%, #1e3a8a 50%, #1d4ed8 100%)',
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 25px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 20px 50px rgba(0, 0, 0, 0.12)',
        'glow': '0 8px 30px rgba(37, 99, 235, 0.25)',
        'glow-lg': '0 15px 40px rgba(37, 99, 235, 0.35)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.8s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.8s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'bounce-slow': 'bounceSlow 2s ease-in-out infinite',
        'wa-ping': 'waPing 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        waPing: {
          '0%': { transform: 'scale(1)', opacity: '0.4' },
          '75%, 100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
