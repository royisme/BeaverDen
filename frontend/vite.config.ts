import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@types': path.resolve(__dirname, './src/types'),
      '@pages': path.resolve(__dirname, './src/pages'),
    },
  },
  base: './',
  build: {
    outDir: '../electron/build/',
    assetsDir: 'assets',
    assetsInlineLimit: 4096, // 小于此大小的资源会被内联为 base64

    // 生产环境配置
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          zustand: ['zustand'],
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  publicDir: 'public',       // 静态资源服务的文件夹

  // 开发服务器配置
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8486',
        changeOrigin: true
      }
    }
  },
})