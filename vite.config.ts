import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// With a custom domain (radiobench.dev), the site is served from root.
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
