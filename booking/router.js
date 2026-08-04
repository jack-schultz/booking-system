const ROUTE_PATHS = {
    'display-list': 'display-list',
    'display-table': 'display-table',
    create: 'create',
    walkin: 'walkin',
    metrics: 'metrics',
    tables: 'tables',
    'sync-status': 'sync-status',
};

const BOOKING_ROUTE_RE = /\/booking\/(display-list|display-table|create|walkin|metrics|tables|sync-status)\/?$/;

/**
 * @returns {{ name: keyof typeof ROUTE_PATHS, editId: string | null, returnTo: string | null }}
 */
export function parseRouteFromLocation(location = window.location) {
    const pathname = location.pathname.replace(/\/$/, '');
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    const returnTo = params.get('return');
    const match = pathname.match(BOOKING_ROUTE_RE);
    const name = match?.[1] ?? 'display-list';
    return {
        name,
        editId: name === 'create' ? editId : null,
        returnTo: name === 'create' ? returnTo : null,
    };
}

function buildUrl(routeName, { edit, returnTo } = {}) {
    const segment = ROUTE_PATHS[routeName] ?? ROUTE_PATHS['display-list'];
    const base = import.meta.env.BASE_URL;
    const url = new URL(`${base}booking/${segment}`, window.location.origin);
    if (edit) {
        url.searchParams.set('edit', edit);
    } else {
        url.searchParams.delete('edit');
    }
    if (returnTo) {
        url.searchParams.set('return', returnTo);
    } else {
        url.searchParams.delete('return');
    }
    return `${url.pathname}${url.search}`;
}

/**
 * @param {{
 *   db: import('@powersync/web').PowerSyncDatabase,
 *   registerOnAccountSwitch: (fn: Function) => () => void,
 *   setActiveRoute: (route: string) => void,
 *   views: Record<string, { mount: Function, unmount: Function }>,
 * }} ctx
 */
export function createBookingRouter(ctx) {
    const { db, registerOnAccountSwitch, setActiveRoute, views } = ctx;
    let currentRoute = null;
    let currentParams = {};
    let mounting = false;

    const viewContainers = {
        'display-list': document.getElementById('view-display-list'),
        'display-table': document.getElementById('view-display-table'),
        create: document.getElementById('view-create'),
        walkin: document.getElementById('view-walkin'),
        metrics: document.getElementById('view-metrics'),
        tables: document.getElementById('view-tables'),
        'sync-status': document.getElementById('view-sync-status'),
    };

    function showViewContainer(name) {
        for (const [key, el] of Object.entries(viewContainers)) {
            if (!el) continue;
            el.hidden = key !== name;
        }
    }

    async function mountView(name, params = {}) {
        const view = views[name];
        if (!view) {
            throw new Error(`Unknown route: ${name}`);
        }

        showViewContainer(name);
        setActiveRoute(name);

        await view.mount({
            db,
            registerOnAccountSwitch,
            onNavigate: navigate,
            ...params,
        });
    }

    async function unmountCurrent() {
        if (!currentRoute) return;
        const view = views[currentRoute];
        if (view?.unmount) {
            await view.unmount();
        }
    }

    async function navigate(name, { edit, returnTo, replace = false } = {}) {
        if (mounting) return;
        if (
            currentRoute === name
            && (name !== 'create' || (edit ?? null) === currentParams.editId)
            && (name !== 'create' || (returnTo ?? null) === currentParams.returnTo)
        ) {
            return;
        }

        mounting = true;
        try {
            const url = buildUrl(name, { edit, returnTo });
            const state = { route: name, editId: edit ?? null, returnTo: returnTo ?? null };
            if (replace) {
                history.replaceState(state, '', url);
            } else {
                history.pushState(state, '', url);
            }

            await unmountCurrent();
            currentRoute = name;
            currentParams = { editId: edit ?? null, returnTo: returnTo ?? null };
            await mountView(name, { editId: edit ?? null, returnTo: returnTo ?? null });
        } finally {
            mounting = false;
        }
    }

    async function start() {
        const { name, editId, returnTo } = parseRouteFromLocation();
        currentRoute = name;
        currentParams = { editId, returnTo };
        showViewContainer(name);
        setActiveRoute(name);
        await mountView(name, { editId, returnTo });

        window.addEventListener('popstate', async (event) => {
            if (mounting) return;
            mounting = true;
            try {
                const parsed = parseRouteFromLocation();
                const state = event.state;
                const routeName = state?.route ?? parsed.name;
                const edit = state?.editId ?? parsed.editId;
                const returnRoute = state?.returnTo ?? parsed.returnTo;

                await unmountCurrent();
                currentRoute = routeName;
                currentParams = { editId: edit, returnTo: returnRoute };
                showViewContainer(routeName);
                setActiveRoute(routeName);
                await mountView(routeName, { editId: edit, returnTo: returnRoute });
            } finally {
                mounting = false;
            }
        });
    }

    return { start, navigate };
}
