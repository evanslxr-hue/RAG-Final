/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B1320',
        header: '#0F1C33',
        accent: '#2EC4B6',
        card: '#101B2D',
        border: '#203047',
        orange: '#F6AE2D',
        muted: '#B8C4D9',
        white: '#FFFFFF'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(3, 8, 18, 0.35)'
      }
    }
  },
  plugins: []
};
