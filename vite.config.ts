import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      pfx: fs.readFileSync("C:\\Users\\erezh\\OneDrive\\Desktop\\localhost.pfx"), 
      passphrase: "1234",
    },
    host: true,
    port: 5173,
    hmr: { protocol: "wss" },
  },
})
