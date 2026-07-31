/**
 * Persistent banner shown on every booking-app screen for demo sandbox accounts.
 */
export function mountDemoBanner() {
    if (document.getElementById('demo-banner')) return;

    document.body.classList.add('demo-mode');

    const banner = document.createElement('div');
    banner.id = 'demo-banner';
    banner.className = 'demo-banner';
    banner.setAttribute('role', 'status');
    banner.innerHTML =
        '<strong>Demo account</strong> · Shared sandbox · Max 5 bookings · Resets periodically · ' +
        '<a href="../signup.html">Sign up for a real account</a>';

    const navbar = document.querySelector('.site-navbar');
    const pageContent = document.querySelector('.page-content');

    if (navbar?.parentNode) {
        navbar.parentNode.insertBefore(banner, navbar.nextSibling);
    } else if (pageContent) {
        pageContent.parentNode.insertBefore(banner, pageContent);
    } else {
        document.body.prepend(banner);
    }
}
