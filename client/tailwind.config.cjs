const path = require('path');
/** Colors read live CSS variables so the whole site can re-theme per destination. */
module.exports = {
  content: [path.join(__dirname, 'index.html'), path.join(__dirname, 'src/**/*.{ts,tsx}')],
  theme: {
    extend: {
      colors: {
        deep: 'var(--c-deep)',
        mist: 'var(--c-mist)',
        accent: 'var(--c-accent)',
        stone: 'var(--c-stone)',
        glow: 'var(--c-glow)',
      },
      fontFamily: {
        display: ['"Bodoni Moda"', 'Didot', 'Georgia', 'serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
        bn: ['"Hind Siliguri"', '"Noto Sans Bengali"', 'sans-serif'],
      },
      screens: { xs: '420px' },
      transitionTimingFunction: { cine: 'cubic-bezier(0.77, 0, 0.18, 1)' },
    },
  },
  plugins: [],
};
