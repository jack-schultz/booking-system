(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(e,{basePath:n=``,showAuthControls:r=!1}={}){e.outerHTML=`
        <div class="site-navbar">
            <div class="site-navbar-links-primary">
            <a href="${n}index.html">Home</a>
                <a href="${n}booking/manager.html">Booking Manager</a>
            </div>
            <div class="site-navbar-links-user">
                <span id="offline-indicator" class="offline-indicator" hidden>Offline</span>
                ${r?`<a id="logged_in_user">Not Logged In</a>
            <a id="logoutBtn">Logout</a>`:``}
            </div>
        </div>
    `,t()}function t(){let e=document.getElementById(`offline-indicator`);if(!e)return;function t(){e.hidden=navigator.onLine}window.addEventListener(`online`,t),window.addEventListener(`offline`,t),t()}function n(e,{basePath:t=``}={}){e.outerHTML=`
        <div class="site-footer">
            <div class="site-footer-links">
                <a href="${t}docs/index.html">Docs</a>
                <a href="https://github.com/jack-schultz/booking-system">GitHub</a>
            </div>
        </div>
    `}export{e as n,n as t};