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
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'ui-charts': ['recharts'],
              'auth': ['./services/authService.ts'],
              'pages': [
                './pages/Home.tsx',
                './pages/Login.tsx',
                './pages/Signup.tsx',
                './pages/ProductDetails.tsx',
                './pages/SearchResults.tsx'
              ]
            },
            chunkFileNames: 'chunks/[name]-[hash].js',
            entryFileNames: '[name]-[hash].js'
          }
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
