const ROUTE_PATHS = {
    manager: 'manager.html',
    create: 'create.html',
    walkin: 'walkin.html',
};

/**
 * @returns {{ name: 'manager' | 'create' | 'walkin', editId: string | null }}
 */
export function parseRouteFromLocation(location = window.location) {
    const pathname = location.pathname;
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');

    if (pathname.endsWith('/create.html') || pathname.endsWith('create.html')) {
        return { name: 'create', editId };
    }
    if (pathname.endsWith('/walkin.html') || pathname.endsWith('walkin.html')) {
        return { name: 'walkin', editId: null };
    }
    return { name: 'manager', editId: null };
}

function buildUrl(routeName, { edit } = {}) {
    const path = ROUTE_PATHS[routeName] ?? ROUTE_PATHS.manager;
    const url = new URL(path, window.location.href);
    if (edit) {
        url.searchParams.set('edit', edit);
    } else {
        url.searchParams.delete('edit');
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
        manager: document.getElementById('view-manager'),
        create: document.getElementById('view-create'),
        walkin: document.getElementById('view-walkin'),
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

    async function navigate(name, { edit, replace = false } = {}) {
        if (mounting) return;
        if (currentRoute === name && (name !== 'create' || (edit ?? null) === currentParams.editId)) {
            return;
        }

        mounting = true;
        try {
            const url = buildUrl(name, { edit });
            if (replace) {
                history.replaceState({ route: name, editId: edit ?? null }, '', url);
            } else {
                history.pushState({ route: name, editId: edit ?? null }, '', url);
            }

            await unmountCurrent();
            currentRoute = name;
            currentParams = { editId: edit ?? null };
            await mountView(name, { editId: edit ?? null });
        } finally {
            mounting = false;
        }
    }

    async function start() {
        const { name, editId } = parseRouteFromLocation();
        currentRoute = name;
        currentParams = { editId };
        showViewContainer(name);
        setActiveRoute(name);
        await mountView(name, { editId });

        window.addEventListener('popstate', async (event) => {
            if (mounting) return;
            mounting = true;
            try {
                const state = event.state;
                const routeName = state?.route ?? parseRouteFromLocation().name;
                const edit = state?.editId ?? parseRouteFromLocation().editId;

                await unmountCurrent();
                currentRoute = routeName;
                currentParams = { editId: edit };
                showViewContainer(routeName);
                setActiveRoute(routeName);
                await mountView(routeName, { editId: edit });
            } finally {
                mounting = false;
            }
        });
    }

    return { start, navigate };
}
