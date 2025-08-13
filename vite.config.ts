import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// This is a standard Vite config for a React SPA on Vercel.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // We explicitly disable SSR to be safe.
  build: {
    ssr: false, 
  }
})
