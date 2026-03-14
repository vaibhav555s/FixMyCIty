/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        'background': '#FDFDFD',
        'surface': '#FFFFFF',
        'surface-hover': '#F4F4F5',
        'text-primary': '#09090B', // zinc-950
        'text-secondary': '#71717A', // zinc-500
        'text-tertiary': '#A1A1AA', // zinc-400
        'accent': '#18181B', // zinc-900
        'borders': '#E4E4E7', // zinc-200
        'subtle': '#F4F4F5', // zinc-100
        'brand': {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'element': '0 1px 2px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'slide-up-fade': 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUpFade: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
};