/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdecd7',
          200: '#fad5ae',
          300: '#f6b87a',
          400: '#f19344',
          500: '#ed7620',
          600: '#de5c16',
          700: '#b84514',
          800: '#933818',
          900: '#773016',
          950: '#40160a',
        },
        library: {
          dark: '#1a1612',
          darker: '#0f0d0b',
          warm: '#2d2520',
          accent: '#c9a87c',
          gold: '#d4a955',
          cream: '#f5f0e8',
          paper: '#faf8f5'
        }
      },
      fontFamily: {
        'display': ['Playfair Display', 'Georgia', 'serif'],
        'body': ['Source Sans 3', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'book': '4px 4px 0 rgba(0,0,0,0.1), 8px 8px 0 rgba(0,0,0,0.05)',
        'card': '0 4px 20px rgba(0,0,0,0.08)',
        'elevated': '0 10px 40px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}