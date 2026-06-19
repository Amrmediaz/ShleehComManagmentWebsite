import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/management/',
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'https://shleeh.com',
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },
})
