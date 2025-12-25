import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://pinterest-downloader-download-pinterest-image-video-and-reels.p.rapidapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          'x-rapidapi-host': 'pinterest-downloader-download-pinterest-image-video-and-reels.p.rapidapi.com',
          'x-rapidapi-key': '0b54688e52msh9f5155a08141c69p1073e8jsnc51fa988e886'
        }
      }
    }
  }
})
