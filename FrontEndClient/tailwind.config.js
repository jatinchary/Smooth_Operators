/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        'none': '0',
        'sm': '8px',
        DEFAULT: '8px',
        'md': '8px',
        'lg': '8px',
        'xl': '8px',
        '2xl': '8px',
        '3xl': '8px',
        'full': '9999px',
      },
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
        // Brand colors with gradients - using CSS variables for dynamic theming
        brand: {
          primary: 'var(--theme-primary, #E7E9BB)',
          'primary-dark': 'var(--theme-primary-dark, #403B4A)',
          secondary: 'var(--theme-primary, #E7E9BB)',
          accent: 'var(--theme-primary, #E7E9BB)',
          focus: 'var(--theme-primary, #E7E9BB)',
        },
      },
      backgroundImage: {
        'gradient-primary': 'var(--theme-gradient, linear-gradient(to right, #E7E9BB, #403B4A))',
        'gradient-secondary': 'var(--theme-gradient-secondary, linear-gradient(135deg, #E7E9BB 0%, #403B4A 100%))',
        'gradient-accent': 'var(--theme-gradient-secondary, linear-gradient(135deg, #E7E9BB 0%, #403B4A 100%))',
        'gradient-dark': 'linear-gradient(180deg, #1a1d25 0%, #252932 100%)',
        'gradient-card': 'var(--theme-gradient-card, linear-gradient(135deg, rgba(231, 233, 187, 0.1) 0%, rgba(64, 59, 74, 0.05) 100%))',
        'gradient-logo': 'var(--theme-gradient-logo, linear-gradient(to right, #E7E9BB, #403B4A))',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(231, 233, 187, 0.3)',
        'glow-lg': '0 0 30px rgba(231, 233, 187, 0.4)',
      },
    },
  },
  plugins: [],
}

