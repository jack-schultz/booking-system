import { marked } from 'https://cdn.jsdelivr.net/npm/marked/+esm';
import { mountSiteFooter } from '../ui/footer.js';
import { mountPublicNavbar } from "../ui/navbar.js";

export const DOC_PAGES = [
    { slug: 'index', title: 'Documentation', md: 'index.md' },
    { slug: 'getting-started', title: 'Getting started', md: 'getting-started.md' },
    { slug: 'architecture', title: 'Architecture', md: 'architecture.md' },
    { slug: 'booking-shell', title: 'Booking shell', md: 'booking-shell.md' },
    { slug: 'authentication', title: 'Authentication', md: 'authentication.md' },
    { slug: 'database', title: 'Database', md: 'database.md' },
    { slug: 'powersync-supabase', title: 'PowerSync + Supabase', md: 'powersync-supabase.md' },
    { slug: 'deployment', title: 'Deployment', md: 'deployment.md' },
];

/** heading slug for anchor links (e.g. "Watched queries (live UI)" → "watched-queries-live-ui"). */
function slugifyHeading(text) {
    return text
        .toLowerCase()
        .replace(/<[^>]*>/g, '')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

marked.use({
    renderer: {
        heading({ tokens, depth }) {
            const text = this.parser.parseInline(tokens);
            const id = slugifyHeading(text);
            return `<h${depth} id="${id}">${text}</h${depth}>\n`;
        },
    },
});

function currentSlug() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    return page.replace(/\.html$/, '') || 'index';
}

function renderSidebar() {
    const sidebar = document.getElementById('docs-sidebar');
    if (!sidebar) return;

    const active = currentSlug();
    const items = DOC_PAGES.map(
        (page) =>
            `<li><a href="${page.slug}.html"${page.slug === active ? ' class="active"' : ''}>${page.title}</a></li>`
    ).join('');

    sidebar.innerHTML = `<h2>Docs</h2><ul>${items}</ul>`;
}

function rewriteMdLinks(container) {
    container.querySelectorAll('a[href]').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('#')) return;

        if (href.includes('.md')) {
            link.setAttribute('href', href.replace(/\.md(?=[#?]|$)/, '.html'));
        }
    });
}

/** Scroll to a hash target after async markdown render (browser default scroll runs too early). */
function scrollToHashTarget() {
    const hash = window.location.hash;
    if (!hash) return;

    const id = decodeURIComponent(hash.slice(1));
    const target = document.getElementById(id);
    if (target) {
        target.scrollIntoView();
    }
}

export async function initDocPage(mdPath, title) {
    mountPublicNavbar(document.getElementById('site-navbar-mount'), {
        basePath: '../',
    });
    mountSiteFooter(document.getElementById('site-footer-mount'), {
        basePath: '../',
    });

    document.title = `${title} — Booking System Docs`;
    renderSidebar();

    const content = document.getElementById('doc-content');
    content.innerHTML = '<p class="docs-loading">Loading…</p>';

    try {
        const response = await fetch(mdPath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const markdown = await response.text();
        content.innerHTML = marked.parse(markdown);
        rewriteMdLinks(content);
        scrollToHashTarget();
    } catch (error) {
        content.innerHTML = `<p>Failed to load <code>${mdPath}</code>: ${error.message}</p>`;
    }
}
