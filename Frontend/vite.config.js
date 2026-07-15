import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
 plugins: [react()],
 server:{
   proxy:{
     '/api':{
       target: 'https://shopnest-c52n.onrender.com' || 'https://localhost:5000',
       changeOrigin:true
     }
   }
 }
})