if (import.meta.env.PROD) {
    const { registerSW } = await import('virtual:pwa-register');
    registerSW({ immediate: true });
}
