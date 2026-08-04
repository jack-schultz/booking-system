import { execSync } from 'node:child_process';
import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { bookingRoutePlugin } from './vite/bookingRoutePlugin.js';

const DEV_DB_FILENAME = 'bookings-dev.db';

function resolveDbFilename() {
    if (process.env.VITE_DB_FILENAME) {
        return process.env.VITE_DB_FILENAME;
    }
    try {
        const branch = execSync('git rev-parse --abbrev-ref HEAD', {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
        if (branch === 'dev') {
            return DEV_DB_FILENAME;
        }
    } catch {
        // Not a git repo or git unavailable.
    }
    return undefined;
}

function copyDocsMarkdown() {
    return {
        name: 'copy-docs-markdown',
        writeBundle(options) {
            const outDir = options.dir ?? 'dist';
            const docsDir = resolve(__dirname, 'docs');
            const targetDir = resolve(outDir, 'docs');
            mkdirSync(targetDir, { recursive: true });

            for (const file of readdirSync(docsDir)) {
                if (file.endsWith('.md')) {
                    cpSync(resolve(docsDir, file), resolve(targetDir, file));
                }
            }
        },
    };
}

const dbFilename = resolveDbFilename();

export default defineConfig({
    base: process.env.VITE_BASE_PATH ?? '/',
    define: dbFilename
        ? { 'import.meta.env.VITE_DB_FILENAME': JSON.stringify(dbFilename) }
        : undefined,
    root: '.',
    server: {
        port: 5173,
        open: '/',
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
                confirmEmail: resolve(__dirname, 'confirm-email.html'),
                forgotPassword: resolve(__dirname, 'forgot-password.html'),
                resetPassword: resolve(__dirname, 'reset-password.html'),
                bookingApp: resolve(__dirname, 'booking/app.html'),
                seedBookings: resolve(__dirname, 'seed-bookings.html'),
                docsIndex: resolve(__dirname, 'docs/index.html'),
                docsGettingStarted: resolve(__dirname, 'docs/getting-started.html'),
                docsArchitecture: resolve(__dirname, 'docs/architecture.html'),
                docsBookingShell: resolve(__dirname, 'docs/booking-shell.html'),
                docsAuthentication: resolve(__dirname, 'docs/authentication.html'),
                docsDatabase: resolve(__dirname, 'docs/database.html'),
                docsPowersyncSupabase: resolve(__dirname, 'docs/powersync-supabase.html'),
                docsDeployment: resolve(__dirname, 'docs/deployment.html'),
            },
        },
    },
    plugins: [
        copyDocsMarkdown(),
        bookingRoutePlugin(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['css/shell.css', 'css/auth-pages.css', 'css/booking-app.css', 'css/seed-bookings.css'],
            manifest: {
                name: 'Booking System',
                short_name: 'Bookings',
                theme_color: '#333333',
                background_color: '#87ceeb',
                display: 'standalone',
                start_url: './',
            },
            workbox: {
                navigateFallback: null,
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,wasm}'],
                maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
            },
        }),
    ],
});
