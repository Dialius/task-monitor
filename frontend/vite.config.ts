import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'recharts'],
          'socket-vendor': ['socket.io-client'],
        }
      }
    }
  },
  
  // Server configuration
  server: {
    port: 5173,
    host: true,
    strictPort: false,
  },
  
  // Preview configuration
  preview: {
    port: 4173,
    host: true,
    strictPort: false,
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // Define environment variables
  define: {
    'process.env': {},
  },
})
