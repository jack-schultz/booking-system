import{i as e}from"./syncStatus-CUus1Ppg.js";var t=`
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
</span>`,n={offline:`Offline — sync unavailable`,warning:`Sync in progress or needs attention`,ok:`Sync up to date`},r=null;function i(){let t=document.getElementById(`sync-indicator`);if(!t)return;r?.();function i(e){t.classList.remove(`sync-indicator--offline`,`sync-indicator--warning`,`sync-indicator--ok`),t.classList.add(`sync-indicator--${e}`),t.setAttribute(`aria-label`,n[e]??`Sync status`)}r=e(e=>{i(e.health)})}function a(e){let t=document.getElementById(`sync-indicator`);!t||!e||t.dataset.navWired!==`true`&&(t.dataset.navWired=`true`,t.addEventListener(`click`,t=>{t.preventDefault(),e(`sync-status`)}))}function o(e,{route:r=`sync-status`,href:i}={}){return`<a id="sync-indicator" class="sync-indicator sync-indicator--ok" href="${i??`${e}booking/${r}`}" data-route="${r}" aria-label="${n.ok}">${t}</a>`}var s=[{name:`manager`,label:`Bookings`},{name:`metrics`,label:`Weekly Metrics`},{name:`tables`,label:`Tables`}];function c(){return`<a id="logged_in_user">Not Logged In</a>
            <a id="logoutBtn">Logout</a>`}function l(){let e=document.getElementById(`offline-indicator`);if(!e)return;function t(){e.hidden=navigator.onLine}window.addEventListener(`online`,t),window.addEventListener(`offline`,t),t()}function u(e,{basePath:t=``}={}){e.outerHTML=`
        <div class="site-navbar">
            <div class="site-navbar-links-primary">
                <a href="${t}booking/manager">Open Booking App</a>
            </div>
        </div>
    `}function d(e,{basePath:t=`../`,activeRoute:n,onNavigate:r}={}){let a=o(t,{route:`sync-status`});e.outerHTML=`
        <div class="site-navbar">
            <div class="site-navbar-links-primary">
                ${s.map(({name:e,label:r})=>{let i=n===e;return`<a href="${t}booking/${e===`manager`?`manager`:e}" class="site-navbar-app-link${i?` is-active`:``}" data-route="${e}"${i?` aria-current="page"`:``}>${r}</a>`}).join(``)}
            </div>
            <div class="site-navbar-links-user">
                <span id="offline-indicator" class="offline-indicator" hidden>Offline</span>
                ${a}
                ${c()}
            </div>
        </div>
    `,l(),i(),p(r)}function f({activeRoute:e,onNavigate:t,basePath:n=`../`}={}){let r=document.querySelector(`.site-navbar`);r&&(r.querySelectorAll(`.site-navbar-app-link[data-route]`).forEach(t=>{let n=t.getAttribute(`data-route`)===e;t.classList.toggle(`is-active`,n),n?t.setAttribute(`aria-current`,`page`):t.removeAttribute(`aria-current`)}),p(t),a(t))}function p(e){document.querySelectorAll(`.site-navbar-app-link[data-route]`).forEach(t=>{t.dataset.navWired!==`true`&&(t.dataset.navWired=`true`,t.addEventListener(`click`,n=>{let r=t.getAttribute(`data-route`);!r||!e||(n.preventDefault(),e(r))}))}),a(e)}function m(e,{basePath:t=``}={}){e.outerHTML=`
        <div class="site-footer">
            <div class="site-footer-links">
                <a href="${t}docs/index.html">Docs</a>
                <a href="https://github.com/jack-schultz/booking-system">GitHub</a>
            </div>
        </div>
    `}export{f as i,d as n,u as r,m as t};