/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hazard: {
          emergency: '#dc2626',
          warning: '#ea580c',
          watch: '#d97706',
          advisory: '#2563eb'
        },
        status: {
          critical: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
          neutral: '#64748b',
          clean: '#10b981'
        }
      }
    },
  },
  plugins: [],
}
