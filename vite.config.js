import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

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
                docsIndex: resolve(__dirname, 'docs/index.html'),
                docsGettingStarted: resolve(__dirname, 'docs/getting-started.html'),
                docsArchitecture: resolve(__dirname, 'docs/architecture.html'),
                docsAuthentication: resolve(__dirname, 'docs/authentication.html'),
                docsDatabase: resolve(__dirname, 'docs/database.html'),
                docsPowersyncSupabase: resolve(__dirname, 'docs/powersync-supabase.html'),
                docsDeployment: resolve(__dirname, 'docs/deployment.html'),
            },
        },
    },
    plugins: [copyDocsMarkdown()],
});
