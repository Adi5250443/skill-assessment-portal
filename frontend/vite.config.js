import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  const isDevelopment = command === 'serve';
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      // Only use proxy in development mode
      ...(isDevelopment && {
        proxy: {
          '/api': {
            target: 'http://localhost:5000',
            changeOrigin: true,
          },
        },
      }),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['lucide-react']
          }
        }
      }
    }
  };
});