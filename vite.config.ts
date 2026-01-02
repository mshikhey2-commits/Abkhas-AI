import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      preview: {
        port: 4173,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      build: {
        outDir: 'dist',
        minify: 'esbuild',
        target: 'es2020',
        sourcemap: false,
        reportCompressedSize: false,
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'ui-charts': ['recharts'],
              'lucide-icons': ['lucide-react'],
              'auth': ['./services/authService.ts'],
              'performance': ['./services/performanceCache.ts', './services/performanceOptimization.ts'],
              'pages': [
                './pages/Home.tsx',
                './pages/Login.tsx',
                './pages/Signup.tsx',
                './pages/ProductDetails.tsx',
                './pages/SearchResults.tsx'
              ]
            },
            chunkFileNames: 'chunks/[name]-[hash].js',
            entryFileNames: '[name]-[hash].js',
            assetFileNames: (assetInfo) => {
              const info = assetInfo.name.split('.');
              const ext = info[info.length - 1];
              if (/png|jpe?g|gif|svg/.test(ext)) {
                return `images/[name]-[hash][extname]`;
              } else if (/woff|woff2|eot|ttf|otf/.test(ext)) {
                return `fonts/[name]-[hash][extname]`;
              } else if (ext === 'css') {
                return `css/[name]-[hash][extname]`;
              }
              return `[name]-[hash][extname]`;
            }
          },
          input: {
            main: './index.html'
          }
        },
        // Compression settings
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          }
        },
        // Module preload polyfill
        modulePreload: {
          polyfill: true
        },
        // CSS handling
        cssCodeSplit: true,
        cssMinify: 'esbuild'
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
