/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Paleta oficial do casamento L&L (uso moderado)
        cloud: '#F1F0EC',    // cloud dancer — fundo principal
        graphite: '#2B2C30', // cinza grafite — texto principal e dark sections
        orchid: '#FEE0F2',   // rosa orquídea — accent suave
        sage: '#BFC893',     // verde claro — accent secundário
        olive: '#859366',    // verde escuro — CTAs, numerais, destaque primário
        gold: '#DBC051',     // dourado — detalhes especiais
        brand: {
          // brand.500 remapeado para olive; tons gerados em torno dele
          50: '#f3f5ee',
          100: '#e5ead6',
          200: '#cfd6ae',
          300: '#b8c485',
          400: '#9fae5f',
          500: '#859366',
          600: '#6d7a52',
          700: '#565f42',
          800: '#3f4631',
          900: '#2a2e21',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
};
