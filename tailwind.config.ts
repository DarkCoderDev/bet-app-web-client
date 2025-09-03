/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0f0f0f',
        'dark-container': '#1a1a1a',
        'dark-controls': '#222',
        'dark-input': '#2a2a2a',
        'dark-border': '#333',
        'dark-hover': '#2a2a2a',
        'accent': '#00d4aa',
        'accent-hover': '#00b894',
      }
    },
  }
}
