import{i as e}from"./syncStatus-2needk3u.js";var t=`
<span class="sync-indicator-graphic" aria-hidden="true">
    <span class="sync-indicator-core"></span>
    <svg class="sync-indicator-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <g class="sync-indicator-outer" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 16h5v5"/>
        </g>
    </svg>
</span>`,n={offline:`Offline — sync unavailable`,warning:`Sync in progress or needs attention`,ok:`Sync up to date`};function r({basePath:t=``}={}){let r=document.getElementById(`sync-indicator`);if(!r)return;function i(e){r.classList.remove(`sync-indicator--offline`,`sync-indicator--warning`,`sync-indicator--ok`),r.classList.add(`sync-indicator--${e}`),r.setAttribute(`aria-label`,n[e]??`Sync status`)}e(e=>{i(e.health)})}function i(e){return`<a id="sync-indicator" class="sync-indicator sync-indicator--ok" href="${e}sync-status.html" aria-label="${n.ok}">${t}</a>`}function a(e,{basePath:t=``,showAuthControls:n=!1,showSyncIndicator:a=!1}={}){let s=n?`<a id="logged_in_user">Not Logged In</a>
            <a id="logoutBtn">Logout</a>`:``;e.outerHTML=`
        <div class="site-navbar">
            <div class="site-navbar-links-primary">
            <a href="${t}index.html">Home</a>
                <a href="${t}booking/manager.html">Booking Manager</a>
                <a href="${t}booking/metrics.html">Weekly Metrics</a>
            </div>
            <div class="site-navbar-links-user">
                <span id="offline-indicator" class="offline-indicator" hidden>Offline</span>
                ${a?i(t):``}
                ${s}
            </div>
        </div>
    `,o(),a&&r({basePath:t})}function o(){let e=document.getElementById(`offline-indicator`);if(!e)return;function t(){e.hidden=navigator.onLine}window.addEventListener(`online`,t),window.addEventListener(`offline`,t),t()}function s(e,{basePath:t=``}={}){e.outerHTML=`
        <div class="site-footer">
            <div class="site-footer-links">
                <a href="${t}docs/index.html">Docs</a>
                <a href="https://github.com/jack-schultz/booking-system">GitHub</a>
            </div>
        </div>
    `}export{a as n,s as t};