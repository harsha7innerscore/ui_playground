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
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true
        },
        '/auth': {
          target: 'http://localhost:8000',
          changeOrigin: true
        }
      }
    },
    define: {
      'process.env.VITE_GITHUB_CLIENT_ID': JSON.stringify(env.GITHUB_CLIENT_ID)
    }
  };
});