import { bootstrapBookingApp } from './bootstrap.js';
import { createBookingRouter, parseRouteFromLocation } from './router.js';
import { mountManagerView, unmountManagerView } from './views/managerView.js';
import { mountCreateView, unmountCreateView } from './views/createView.js';
import { mountWalkinView, unmountWalkinView } from './views/walkinView.js';
import { mountMetricsView, unmountMetricsView } from './views/metricsView.js';
import { mountTablesView, unmountTablesView } from './views/tablesView.js';
import { mountSyncStatusView, unmountSyncStatusView } from './views/syncStatusView.js';

const { name: initialRoute } = parseRouteFromLocation();
/** @type {((route: string, options?: { edit?: string, replace?: boolean }) => void) | null} */
let navigateRef = null;

const ctx = await bootstrapBookingApp({
    initialRoute,
    onNavigate: (route, options) => navigateRef?.(route, options),
});

const router = createBookingRouter({
    ...ctx,
    views: {
        manager: { mount: mountManagerView, unmount: unmountManagerView },
        create: { mount: mountCreateView, unmount: unmountCreateView },
        walkin: { mount: mountWalkinView, unmount: unmountWalkinView },
        metrics: { mount: mountMetricsView, unmount: unmountMetricsView },
        tables: { mount: mountTablesView, unmount: unmountTablesView },
        'sync-status': { mount: mountSyncStatusView, unmount: unmountSyncStatusView },
    },
});

navigateRef = router.navigate;
await router.start();
