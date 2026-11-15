import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // npm run dev (frontend) -> API calls go to the local Express backend
    proxy: { '/api': 'http://localhost:5000' },
  },
})
