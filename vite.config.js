import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path"
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        tailwindcss()
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@img': path.resolve(__dirname, './src/assets/images'),
        }
    },
    server:{
        host:'0.0.0.0',
        changeOrigin:true,
        ws:true
    },
    base:'./'
})
