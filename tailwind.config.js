/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        bg: 'var(--color-bg)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        'text-2': 'var(--color-text-2)',
        'text-3': 'var(--color-text-3)',
        city: 'var(--color-city)',
        'city-bg': 'var(--color-city-bg)',
        'city-text': 'var(--color-city-text)',
        golf: 'var(--color-golf)',
        'golf-light': 'var(--color-golf-light)',
        'golf-text': 'var(--color-golf-text)',
        ideal: 'var(--color-ideal)',
        good: 'var(--color-good)',
        hard: 'var(--color-hard)',
        bad: 'var(--color-bad)',
        'alert-bg': 'var(--color-alert-bg)',
        'alert-text': 'var(--color-alert-text)',
      },
    },
  },
  plugins: [],
};
