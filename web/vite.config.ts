import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const lanHost = env.VITE_DEV_LAN_HOST
  const lanDev = Boolean(lanHost)

  return {
    plugins: [react(), ...(lanDev ? [basicSsl()] : [])],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'react-vendor';
              }
              if (id.includes('framer-motion')) {
                return 'animations';
              }
              return 'vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      host: true,
      port: 5173,
      // basicSsl() activa HTTPS cuando VITE_DEV_LAN_HOST está definido.
      allowedHosts: true,
      hmr: lanHost
        ? { host: lanHost, port: 5173, protocol: lanDev ? 'wss' : 'ws' }
        : undefined,
      // Un solo puerto para dispositivos móviles: el iPad solo abre :5173.
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8001',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://127.0.0.1:8001',
          changeOrigin: true,
        },
      },
    },
  }
})
