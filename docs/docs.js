import { marked } from 'https://cdn.jsdelivr.net/npm/marked/+esm';

export const DOC_PAGES = [
    { slug: 'index', title: 'Documentation', md: 'index.md' },
    { slug: 'getting-started', title: 'Getting started', md: 'getting-started.md' },
    { slug: 'architecture', title: 'Architecture', md: 'architecture.md' },
    { slug: 'authentication', title: 'Authentication', md: 'authentication.md' },
    { slug: 'database', title: 'Database', md: 'database.md' },
    { slug: 'powersync-supabase', title: 'PowerSync + Supabase', md: 'powersync-supabase.md' },
    { slug: 'deployment', title: 'Deployment', md: 'deployment.md' },
];

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

        if (href.endsWith('.md')) {
            link.setAttribute('href', href.replace(/\.md$/, '.html'));
        }
    });
}

export async function initDocPage(mdPath, title) {
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
    } catch (error) {
        content.innerHTML = `<p>Failed to load <code>${mdPath}</code>: ${error.message}</p>`;
    }
}
