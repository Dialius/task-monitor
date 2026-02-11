/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#1e1e1e',
        'bg-secondary': '#252526',
        'bg-tertiary': '#2d2d30',
        'bg-elevated': '#3e3e42',
        'text-primary': '#00ff00',
        'text-secondary': '#cccccc',
        'text-muted': '#858585',
        'accent': '#007acc',
        'accent-hover': '#005a9e',
        'success': '#4ec9b0',
        'warning': '#ce9178',
        'error': '#f48771',
        'info': '#569cd6',
        'border': '#3e3e42',
        'border-focus': '#007acc',
      },
    },
  },
  plugins: [],
}
