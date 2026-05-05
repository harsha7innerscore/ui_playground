import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file from parent directory
  const env = loadEnv(mode, '../', '');

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/github-api/login': {
          target: 'https://github.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/github-api/, '')
        },
        '/github-api': {
          target: 'https://api.github.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/github-api/, '')
        },
        '/anthropic-api': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/anthropic-api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              // Ensure auth headers are preserved
              if (req.headers.authorization) {
                proxyReq.setHeader('authorization', req.headers.authorization);
              }
            });
          }
        }
      }
    },
    define: {
      'process.env.VITE_GITHUB_CLIENT_ID': JSON.stringify(env.GITHUB_CLIENT_ID)
    }
  };
});