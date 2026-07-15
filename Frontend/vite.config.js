import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
 plugins: [react()],
 server:{
   proxy:{
     '/api':{
       target: env.VITE_API_URL || 'http://shopnest-c52n.onrender.com' || 'http://localhost:5000',
       changeOrigin:true
     }
   }
 }
})