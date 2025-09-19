import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  base: '/saeima/',                                 // GitHub Pages project path
  root: path.resolve(__dirname, 'client'),          // tell Vite where index.html lives
  build: {
    outDir: path.resolve(__dirname, 'docs'),        // put build in /docs at repo root
    emptyOutDir: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client', 'src'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
})
