import"./style-BJcfAIxS.js";import"./register-CxERNST-.js";import{i as e,n as t,t as n}from"./syncStatus-B8c62kbC.js";import{r}from"./accountSwitcher-CsnH6aBP.js";import{n as i,t as a}from"./footer-BFG4yJVO.js";import{i as o}from"./sync-DF-SSIE-.js";import{n as s,t as c}from"./db-MGT5tZiC.js";i(document.getElementById(`site-navbar-mount`),{showAuthControls:!0,showSyncIndicator:!0}),a(document.getElementById(`site-footer-mount`));var l=document.getElementById(`sync-status-summary`),u=document.getElementById(`sync-status-uploads-list`),d=document.getElementById(`sync-status-downloads-list`),f=document.getElementById(`sync-status-issues-list`),p=document.getElementById(`sync-status-reconnect-btn`);await r({requireAuth:!0,loginRedirect:`login.html`});var m=await s();c(m);function h(e){p.disabled=!1,navigator.onLine?e&&m.connected?p.textContent=`Reconnect`:p.textContent=`Failed to connect`:p.textContent=`Offline`}p.addEventListener(`click`,async()=>{p.disabled=!0,p.textContent=`Reconnecting...`;let e=null;try{e=await o(m)}finally{h(e)}}),window.addEventListener(`online`,()=>{p.textContent===`Offline`&&(p.textContent=`Reconnect`)});function g(e){return e?new Date(e).toLocaleString():`—`}function _(e){return e==null?``:e<1024?`${e} B`:`${(e/1024).toFixed(1)} kB`}function v(e){return e===`offline`?`Offline`:e===`warning`?`Attention needed`:`Up to date`}function y(e){let t=e.online?e.connected?`Connected`:e.connecting?`Connecting…`:`Disconnected`:`Offline`;l.innerHTML=`
        <div class="sync-status-metric sync-status-metric--${e.health}">
            <span class="sync-status-metric-label">Status</span>
            <span class="sync-status-metric-value">${v(e.health)}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Connection</span>
            <span class="sync-status-metric-value">${t}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Last synced</span>
            <span class="sync-status-metric-value">${g(e.lastSyncedAt)}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Pending uploads</span>
            <span class="sync-status-metric-value">${e.uploadQueueCount}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Local bookings</span>
            <span class="sync-status-metric-value">${e.bookingCount??`—`}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Sync mode</span>
            <span class="sync-status-metric-value">${e.syncConfigured?`PowerSync`:`Local only`}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Restaurant</span>
            <span class="sync-status-metric-value">${e.hasRestaurant?e.restaurantId:`Not assigned`}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Account</span>
            <span class="sync-status-metric-value">${e.accountName}</span>
        </div>
    `,e.statusMessage&&l.insertAdjacentHTML(`beforeend`,`<p class="sync-status-message">${b(e.statusMessage)}</p>`)}function b(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function x(e){let t=[e.opData?.first_name,e.opData?.last_name].filter(Boolean).join(` `),n=e.opData?.datetime??``,r=e.opData?.status??``;return`
        <article class="sync-status-item">
            <div class="sync-status-item-header">
                <span class="sync-status-op-badge sync-status-op-badge--${e.op.toLowerCase()}">${e.op}</span>
                <span class="sync-status-item-id">${b(e.id)}</span>
            </div>
            ${t?`<p class="sync-status-item-detail">${b(t)}</p>`:``}
            ${n?`<p class="sync-status-item-detail">${b(n)}</p>`:``}
            ${r?`<p class="sync-status-item-detail">Status: ${b(r)}</p>`:``}
            <p class="sync-status-item-meta">Table: ${b(e.table)}</p>
        </article>
    `}function S(e){if(e.pendingUploads.length===0){u.innerHTML=`<p class="sync-status-empty">No pending uploads${e.uploadQueueSize==null?``:` (${_(e.uploadQueueSize)})`}</p>`;return}u.innerHTML=(e.uploadQueueSize==null?``:`<p class="sync-status-queue-size">Queue size: ${_(e.uploadQueueSize)}</p>`)+e.pendingUploads.map(x).join(``)}function C(e){let t=[],r=e.dataFlowStatus??{};if(r.downloading&&e.downloadProgress){let n=Math.round(e.downloadProgress.downloadedFraction*100);t.push(`
            <div class="sync-status-download-progress">
                <p>Downloading… ${e.downloadProgress.downloadedOperations} / ${e.downloadProgress.totalOperations} operations</p>
                <div class="sync-status-progress-bar" role="progressbar" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="100">
                    <div class="sync-status-progress-bar-fill" style="width: ${n}%"></div>
                </div>
            </div>
        `)}if(e.syncStreams?.length)for(let n of e.syncStreams){let e=n.progress,r=n.subscription?.name??`Sync stream`;if(e){let n=Math.round(e.downloadedFraction*100);t.push(`
                    <article class="sync-status-item">
                        <p class="sync-status-item-detail">${b(r)}</p>
                        <p class="sync-status-item-meta">${e.downloadedOperations} / ${e.totalOperations} (${n}%)</p>
                    </article>
                `)}else t.push(`
                    <article class="sync-status-item">
                        <p class="sync-status-item-detail">${b(r)}</p>
                        <p class="sync-status-item-meta">Idle</p>
                    </article>
                `)}r.downloading||t.push(`
            <article class="sync-status-item sync-status-item--summary">
                <p class="sync-status-item-detail">${e.hasSynced?`Up to date`:`Waiting for first sync`}</p>
                <p class="sync-status-item-meta">Last synced: ${g(e.lastSyncedAt)}</p>
                ${e.bookingCount==null?``:`<p class="sync-status-item-meta">${e.bookingCount} booking(s) stored locally</p>`}
            </article>
        `);let i=n();if(i.length>0){t.push(`<h3 class="sync-status-activity-heading">Recent download activity</h3>`);for(let e of i)t.push(`
                <article class="sync-status-item">
                    <p class="sync-status-item-detail">${g(e.at)}</p>
                    <p class="sync-status-item-meta">${e.operations==null?`Download completed`:`${e.operations} operations received`}</p>
                </article>
            `)}r.uploading&&t.unshift(`<p class="sync-status-active-label">Uploading changes…</p>`),d.innerHTML=t.length?t.join(``):`<p class="sync-status-empty">No download activity</p>`}function w(e){let n=[],r=e.dataFlowStatus??{};r.downloadError&&n.push(`
            <article class="sync-status-issue sync-status-issue--error">
                <p class="sync-status-issue-type">Download error</p>
                <p class="sync-status-issue-message">${b(r.downloadError.message??String(r.downloadError))}</p>
            </article>
        `),r.uploadError&&n.push(`
            <article class="sync-status-issue sync-status-issue--error">
                <p class="sync-status-issue-type">Upload error</p>
                <p class="sync-status-issue-message">${b(r.uploadError.message??String(r.uploadError))}</p>
            </article>
        `),e.syncConfigured&&!e.hasRestaurant&&n.push(`
            <article class="sync-status-issue sync-status-issue--warning">
                <p class="sync-status-issue-type">Restaurant not assigned</p>
                <p class="sync-status-issue-message">Your account has no restaurant_id. Sync cannot start until an admin assigns one.</p>
            </article>
        `),e.syncConfigured||n.push(`
            <article class="sync-status-issue sync-status-issue--warning">
                <p class="sync-status-issue-type">Local-only mode</p>
                <p class="sync-status-issue-message">VITE_POWERSYNC_URL is not configured. Data stays in the browser only.</p>
            </article>
        `),e.uploadQueueCount>0&&e.online&&n.push(`
            <article class="sync-status-issue sync-status-issue--warning">
                <p class="sync-status-issue-type">Pending uploads</p>
                <p class="sync-status-issue-message">${e.uploadQueueCount} change(s) waiting to upload.</p>
            </article>
        `);let i=t();for(let e of i)n.push(`
            <article class="sync-status-issue sync-status-issue--${e.type.includes(`discarded`)?`error`:`warning`}">
                <p class="sync-status-issue-type">${b(e.type.replace(/_/g,` `))}</p>
                <p class="sync-status-issue-message">${b(e.message)}</p>
                <p class="sync-status-issue-meta">${g(e.at)}</p>
            </article>
        `);f.innerHTML=n.length?n.join(``):`<p class="sync-status-empty">No issues detected</p>`}function T(e){y(e),S(e),C(e),w(e)}e(T);