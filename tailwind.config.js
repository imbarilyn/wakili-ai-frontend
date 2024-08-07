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
      },
      fontFamily: {
        'poppins': ['Poppins Regular', 'Ubuntu', 'sans-serif'],
        'poppins-light': ['Poppins Light', 'Ubuntu', 'san-serif', 'serif'],
        'poppins-medium': ['Poppins Medium', 'Ubuntu', 'san-serif', 'serif'],
        'poppins-bold': ['Poppins Bold', 'Ubuntu', 'san-serif', 'serif'],
        'poppins-extra-light': ['Poppins Extralight', 'Ubuntu', 'san-serif', 'serif'],
        'poppins-thin': ['Poppins Thin', 'Ubuntu', 'san-serif', 'serif'],
        'poppins-semi-bold': ['Poppins Semibold', 'Ubuntu', 'san-serif', 'serif'],
        'poppins-extra-bold': ['Poppins Extrabold', 'Ubuntu', 'san-serif', 'serif']
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

