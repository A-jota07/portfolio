import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 1. Isola totalmente o editor pesado e dependências de syntax highlight do admin
          if (id.includes('@mdxeditor/editor') || id.includes('@codemirror')) {
            return 'admin-editor'
          }
          // 2. Isola Markdown e Highlight.js apenas para onde forem necessários
          if (
            id.includes('react-markdown') ||
            id.includes('rehype-highlight') ||
            id.includes('remark-gfm') ||
            id.includes('highlight.js') ||
            id.includes('lowlight')
          ) {
            return 'vendor-markdown'
          }
          // 3. Isola Supabase
          if (id.includes('@supabase')) {
            return 'vendor-supabase'
          }
          // 4. Framework e Roteamento
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router/') ||
            id.includes('node_modules/react-router-dom/')
          ) {
            return 'vendor-framework'
          }
          // 5. Framer Motion
          if (id.includes('framer-motion') || id.includes('motion-dom')) {
            return 'vendor-motion'
          }
          // 6. Lucide Icons
          if (id.includes('lucide-react')) {
            return 'vendor-icons'
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
