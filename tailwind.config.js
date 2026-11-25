/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uno: {
          red: '#ED1C24',
          'red-dark': '#B80D14',
          yellow: '#FFDE00',
          'yellow-dark': '#CCB000',
          green: '#00A651',
          'green-dark': '#007A3D',
          blue: '#0054A6',
          'blue-dark': '#003B75',
          dark: '#0D1117',
          cardBg: '#161B22',
          surface: '#1E2530',
          table: '#0F1923',
          felt: '#0a2318'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Montserrat', 'sans-serif']
      },
      boxShadow: {
        'card': '0 8px 24px -4px rgba(0, 0, 0, 0.45)',
        'card-hover': '0 16px 36px -2px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.2)',
        'glow-red': '0 0 25px rgba(237, 28, 36, 0.65)',
        'glow-yellow': '0 0 25px rgba(255, 222, 0, 0.65)',
        'glow-green': '0 0 25px rgba(0, 166, 81, 0.65)',
        'glow-blue': '0 0 25px rgba(0, 84, 166, 0.65)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(2deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.85' }
        },
        cardDeal: {
          '0%': { transform: 'scale(0.3) translateY(-100px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' }
        }
      },
      animation: {
        'float-slow': 'float 5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'card-deal': 'cardDeal 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }
    },
  },
  plugins: [],
}
