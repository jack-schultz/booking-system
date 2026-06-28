import{t as e}from"./preload-helper-j_ZwnIYB.js";var t=`true`,n=`false`,r=t===`true`,i=n===`true`;function a(t={}){let{immediate:n=!1,onNeedReload:a,onNeedRefresh:o,onOfflineReady:s,onRegistered:c,onRegisteredSW:l,onRegisterError:u}=t,d,f,p,m=async(e=!0)=>{await f,r||p?.()};async function h(){if(`serviceWorker`in navigator){if(d=await e(async()=>{let{Workbox:e}=await import(`./workbox-window.prod.es5-Bd17z0YL.js`);return{Workbox:e}},[]).then(({Workbox:e})=>new e(`/booking-system/dev/sw.js`,{scope:`/booking-system/dev/`,type:`classic`})).catch(e=>{u?.(e)}),!d)return;if(p=()=>{d?.messageSkipWaiting()},!i)if(r)d.addEventListener(`activated`,e=>{(e.isUpdate||e.isExternal)&&(a?a():window.location.reload())}),d.addEventListener(`installed`,e=>{e.isUpdate||s?.()});else{let e=!1,t=()=>{e=!0,d?.addEventListener(`controlling`,e=>{e.isUpdate&&(a?a():window.location.reload())}),o?.()};d.addEventListener(`installed`,n=>{n.isUpdate===void 0?n.isExternal===void 0?!e&&s?.():n.isExternal?t():!e&&s?.():n.isUpdate||s?.()}),d.addEventListener(`waiting`,t)}d.register({immediate:n}).then(e=>{l?l(`/booking-system/dev/sw.js`,e):c?.(e)}).catch(e=>{u?.(e)})}}return f=h(),m}a({immediate:!0});function o(e,{basePath:t=``,showAuthControls:n=!1}={}){e.outerHTML=`
        <div class="site-navbar">
            <div class="site-navbar-links-primary">
                <a href="${t}login.html">Login</a>
                <a href="${t}index.html">Home</a>
                <a href="${t}booking/manager.html">Bookings</a>
            </div>
            <div class="site-navbar-links-user">
                <span id="offline-indicator" class="offline-indicator" hidden>Offline</span>
                ${n?`<a id="logged_in_user">Not Logged In</a>
            <a id="logoutBtn">Logout</a>`:``}
                <a href="https://github.com/jack-schultz/booking-system">GitHub</a>
            </div>
        </div>
    `,s()}function s(){let e=document.getElementById(`offline-indicator`);if(!e)return;function t(){e.hidden=navigator.onLine}window.addEventListener(`online`,t),window.addEventListener(`offline`,t),t()}export{o as t};