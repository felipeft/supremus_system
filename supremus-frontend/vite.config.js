import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Verifique se está assim
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})