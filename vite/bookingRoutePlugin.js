import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

export const BOOKING_SHELL_ROUTES = [
    'manager',
    'create',
    'walkin',
    'metrics',
    'tables',
    'sync-status',
];

const BOOKING_ROUTE_RE = /^\/booking\/(manager|create|walkin|metrics|tables|sync-status)\/?$/;

/**
 * Serves pretty booking URLs in dev and emits static index.html copies at build time
 * so GitHub Pages can serve /booking/manager, /booking/create, etc.
 */
export function bookingRoutePlugin() {
    return {
        name: 'booking-route-plugin',
        configureServer(server) {
            server.middlewares.use((req, _res, next) => {
                const [pathname, query = ''] = (req.url ?? '').split('?');
                if (BOOKING_ROUTE_RE.test(pathname)) {
                    req.url = query ? `/booking/app.html?${query}` : '/booking/app.html';
                }
                next();
            });
        },
        writeBundle(options) {
            const outDir = options.dir ?? 'dist';
            const appHtml = resolve(outDir, 'booking/app.html');
            if (!existsSync(appHtml)) {
                return;
            }

            for (const route of BOOKING_SHELL_ROUTES) {
                const routeDir = resolve(outDir, 'booking', route);
                mkdirSync(routeDir, { recursive: true });
                cpSync(appHtml, resolve(routeDir, 'index.html'));
            }
        },
    };
}
