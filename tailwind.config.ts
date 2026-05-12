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
        ryr: {
          // Colores del logo R&R Centro de Medicina y Optometría
          teal:         '#0AACBE', // círculo turquesa del logo
          'teal-dark':  '#0890A0',
          'teal-light': '#E0F7FA',
          blue:         '#2B5F8E', // texto "R&R" en el logo
          'blue-dark':  '#1F4A70',
          'blue-light': '#D0E4F5',
          orange:       '#F07840', // símbolo + del logo
          'orange-light':'#FEF0EA',
          gray:         '#6D6D6D',
          'gray-light': '#F5F5F5',
          // alias para compatibilidad
          cyan:         '#0AACBE',
          'cyan-light': '#E0F7FA',
          green:        '#0AACBE',
          'green-dark': '#0890A0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':     'fadeIn 0.5s ease-in-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'flash':       'flash 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        flash: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}

export default config
