import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Base URL is set to the GitHub repo name for GitHub Pages.
// If you rename the repo, update this value to match.
// For local dev it falls back to '/'
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/the-radio-bench/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
