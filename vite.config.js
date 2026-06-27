import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    server: {
        port: 5173,
        open: '/login.html',
    },
    optimizeDeps: {
        // PowerSync has web workers and WASM
        exclude: ['@powersync/web'],
    },
    worker: {
        format: 'es',
    },
});
