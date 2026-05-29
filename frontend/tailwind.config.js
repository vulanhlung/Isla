module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        secondary: '#7c3aed',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        isla: {
          bg: '#eef2ff',
          card: '#ffffff',
          blue: '#4f46e5',
          purple: '#7c3aed',
          light: '#e0e7ff',
          cyan: '#06b6d4',
          teal: '#0ea5e9',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 2px 16px 0 rgba(99,102,241,0.08)',
        'card-hover': '0 8px 32px 0 rgba(99,102,241,0.16)',
      }
    },
  },
  plugins: [],
}
