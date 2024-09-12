/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        'main-color': "#050A30",
        'main-color-hover': "#0e1d89",
        'main-color-dark': "",
        'main-color-dark-hover': "",

        'main-color-light': "#091154",
        'main-color-heavy':"#01030c",

        'secondary-color': "#E5E7EB",
        'secondary-color-hover': "",
        'secondary-color-dark': "",
        'secondary-color-dark-hover': "",
        'tertiary-color': "#B9ED79",
        'emerald': {
          300: '#B9ED79',
        },
        'cadet-blue': {
          '50': '#f6f7f8',
          '100': '#eaecef',
          '200': '#dadde3',
          '300': '#c0c7d0',
          '400': '#a9b1be',
          '500': '#8b93a6',
          '600': '#798197',
          '700': '#6d7288',
          '800': '#5c6071',
          '900': '#4c4f5c',
          '950': '#31323a',
        },

      },
      fontFamily: {
        'poppins': ['Poppins Regular', 'Ubuntu', 'sans-serif'],
        'poppins-light': ['Poppins Light', 'Ubuntu', 'san-serif', 'serif'],
        'poppins-medium': ['Poppins Medium', 'Ubuntu', 'san-serif', 'serif'],
        'poppins-bold': ['Poppins Bold', 'Ubuntu', 'san-serif', 'serif'],
        'poppins-extra-light': ['Poppins Extralight', 'Ubuntu', 'san-serif', 'serif'],
        'poppins-thin': ['Poppins Thin', 'Ubuntu', 'san-serif', 'serif'],
        'poppins-semi-bold': ['Poppins Semibold', 'Ubuntu', 'san-serif', 'serif'],
        'poppins-extra-bold': ['Poppins Extrabold', 'Ubuntu', 'san-serif', 'serif'],
        'sf-pro': ['SF Pro Regular', 'Ubuntu', 'sans-serif'],
        'sf-pro-medium': ['SF Pro Medium', 'Ubuntu', 'sans-serif'],
        'sf-pro-bold': ['SF Pro Bold', 'Ubuntu', 'sans-serif'],
        'sf-pro-italic': ['SF Pro Italic', 'Ubuntu', 'sans-serif'],
        'sf-pro-thin-italic': ['SF Pro Thin Italic', 'Ubuntu', 'sans-serif'],
        'sf-pro-light-italic': ['SF Pro Light Italic', 'Ubuntu', 'sans-serif'],
        'sf-pro-ultralight': ['SF Pro Ultralight', 'Ubuntu', 'sans-serif'],
        'sf-pro-semibold-italic': ['SF Pro Semibold Italic', 'Ubuntu', 'sans-serif'],
        'sf-pro-heavy-italic': ['SF Pro Heavy Italic', 'Ubuntu', 'sans-serif'],

      },
    }

  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: ["bumblebee", "dark", "emerald", "forest", "lofi", "synthwave", "retro", "cyberpunk", "halloween", "valentine", "garden", "forest", "dracula", "corporate", "winter", "wireframe", "black"]
  },
  darkMode: 'class'
}

