/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Urbanist', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Staatliches', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontWeight: {
        thin: '100',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      colors: {
        // Dark theme colors
        dark: {
          bg: '#1a1d25',
          surface: '#252932',
          'surface-light': '#2d3240',
          'surface-warm': '#2a2d26',
          border: '#3d4354',
          text: '#e5e7eb',
          'text-secondary': '#9ca3af',
        },
        // Brand colors with gradients
        brand: {
          primary: '#3b82f6',
          'primary-dark': '#2563eb',
          secondary: '#06b6d4',
          accent: '#8b5cf6',
          focus: '#E7E9BB',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #E7E9BB, #403B4A)',
        'gradient-secondary': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        'gradient-accent': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        'gradient-dark': 'linear-gradient(180deg, #1a1d25 0%, #252932 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
        'gradient-logo': 'linear-gradient(to right, #E7E9BB, #403B4A)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(231, 233, 187, 0.3)',
        'glow-lg': '0 0 30px rgba(231, 233, 187, 0.4)',
      },
    },
  },
  plugins: [],
}
