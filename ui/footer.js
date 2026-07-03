/**
 * Renders the shared site footer.
 * @param {HTMLElement} mountPoint - Element replaced by the footer markup
 * @param basePath
 */
export function mountSiteFooter(mountPoint, { basePath = '' } = {}) {
    mountPoint.outerHTML = `
        <div class="site-footer">
            <div class="site-footer-links">
                <a href="${basePath}docs/index.html">Docs</a>
                <a href="https://github.com/jack-schultz/booking-system">GitHub</a>
            </div>
        </div>
    `;
}
