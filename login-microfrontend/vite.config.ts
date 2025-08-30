import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Disable React refresh for production
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    lib: {
      // The entry point for the library
      entry: resolve('./src/main.tsx'),
      name: 'LoginMicrofrontendLib',
      // The file formats to generate
      formats: ['es', 'umd'],
      fileName: (format) => `login-microfrontend.${format}.js`
    },
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: ['react', 'react-dom'],
      output: {
        // Global variables for externalized dependencies
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    // Generate sourcemaps for easier debugging
    sourcemap: true,
  },
})
