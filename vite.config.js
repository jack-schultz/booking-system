import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    base: process.env.VITE_BASE_PATH ?? '/',
    root: '.',
    server: {
        port: 5173,
        open: '/login.html',
    },
    optimizeDeps: {
        exclude: ['@powersync/web'],
    },
    worker: {
        format: 'es',
    },
    build: {
        rollupOptions: {
            input: {
                index: resolve(__dirname, 'index.html'),
                login: resolve(__dirname, 'login.html'),
                signup: resolve(__dirname, 'signup.html'),
                manager: resolve(__dirname, 'booking/manager.html'),
                create: resolve(__dirname, 'booking/create.html'),
                walkin: resolve(__dirname, 'booking/walkin-create.html'),
            },
        },
    },
});
