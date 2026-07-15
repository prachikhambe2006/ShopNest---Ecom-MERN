import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
 plugins: [react()],
 server:{
   proxy:{
     '/api':{
       target:'http://shopnest-c52n.onrender.com/',
       changeOrigin:true
     }
   }
 }
})