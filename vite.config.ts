import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'prop-types': 'prop-types/index.js',
      'hoist-non-react-statics': 'hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js',
      'react-is': 'react-is/index.js'
    },
  },
  server: {
    hmr: {
      overlay: false,
      clientPort: 443,       // ← HTTPSに対応したポートに変更
      protocol: 'wss'        // ← 安全なWebSocket
    },
    watch: {
      usePolling: true,
      interval: 1000
    },
    port: 5173,
    strictPort: true
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'prop-types',
      'hoist-non-react-statics',
      'react-is'
    ],
    exclude: ['react-beautiful-dnd']
  },
  build: {
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
});

