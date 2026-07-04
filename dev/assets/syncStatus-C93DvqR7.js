import{n as e,t}from"./footer-BPRjeWN9.js";import"./register-BgmyEqJt.js";import{r as n}from"./accountSwitcher-DjqSVm1Z.js";import{i as r,n as i,t as a}from"./syncStatus-BT08yccP.js";import{r as o}from"./db-iPnXzGMh.js";import{i as s}from"./sync-CMxr7sL1.js";e(document.getElementById(`site-navbar-mount`),{showAuthControls:!0,showSyncIndicator:!0}),t(document.getElementById(`site-footer-mount`));var c=document.getElementById(`sync-status-summary`),l=document.getElementById(`sync-status-uploads-list`),u=document.getElementById(`sync-status-downloads-list`),d=document.getElementById(`sync-status-issues-list`),f=document.getElementById(`sync-status-reconnect-btn`);await n({requireAuth:!0,loginRedirect:`login.html`});var p=await o();function m(e){f.disabled=!1,navigator.onLine?e&&p.connected?f.textContent=`Reconnect`:f.textContent=`Failed to connect`:f.textContent=`Offline`}f.addEventListener(`click`,async()=>{f.disabled=!0,f.textContent=`Reconnecting...`;let e=null;try{e=await s(p)}finally{m(e)}}),window.addEventListener(`online`,()=>{f.textContent===`Offline`&&(f.textContent=`Reconnect`)});function h(e){return e?new Date(e).toLocaleString():`—`}function g(e){return e==null?``:e<1024?`${e} B`:`${(e/1024).toFixed(1)} kB`}function _(e){return e===`offline`?`Offline`:e===`warning`?`Attention needed`:`Up to date`}function v(e){let t=e.online?e.connected?`Connected`:e.connecting?`Connecting…`:`Disconnected`:`Offline`;c.innerHTML=`
        <div class="sync-status-metric sync-status-metric--${e.health}">
            <span class="sync-status-metric-label">Status</span>
            <span class="sync-status-metric-value">${_(e.health)}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Connection</span>
            <span class="sync-status-metric-value">${t}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Last synced</span>
            <span class="sync-status-metric-value">${h(e.lastSyncedAt)}</span>
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
    `,e.statusMessage&&c.insertAdjacentHTML(`beforeend`,`<p class="sync-status-message">${y(e.statusMessage)}</p>`)}function y(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function b(e){let t=[e.opData?.first_name,e.opData?.last_name].filter(Boolean).join(` `),n=e.opData?.datetime??``,r=e.opData?.status??``;return`
        <article class="sync-status-item">
            <div class="sync-status-item-header">
                <span class="sync-status-op-badge sync-status-op-badge--${e.op.toLowerCase()}">${e.op}</span>
                <span class="sync-status-item-id">${y(e.id)}</span>
            </div>
            ${t?`<p class="sync-status-item-detail">${y(t)}</p>`:``}
            ${n?`<p class="sync-status-item-detail">${y(n)}</p>`:``}
            ${r?`<p class="sync-status-item-detail">Status: ${y(r)}</p>`:``}
            <p class="sync-status-item-meta">Table: ${y(e.table)}</p>
        </article>
    `}function x(e){if(e.pendingUploads.length===0){l.innerHTML=`<p class="sync-status-empty">No pending uploads${e.uploadQueueSize==null?``:` (${g(e.uploadQueueSize)})`}</p>`;return}l.innerHTML=(e.uploadQueueSize==null?``:`<p class="sync-status-queue-size">Queue size: ${g(e.uploadQueueSize)}</p>`)+e.pendingUploads.map(b).join(``)}function S(e){let t=[],n=e.dataFlowStatus??{};if(n.downloading&&e.downloadProgress){let n=Math.round(e.downloadProgress.downloadedFraction*100);t.push(`
            <div class="sync-status-download-progress">
                <p>Downloading… ${e.downloadProgress.downloadedOperations} / ${e.downloadProgress.totalOperations} operations</p>
                <div class="sync-status-progress-bar" role="progressbar" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="100">
                    <div class="sync-status-progress-bar-fill" style="width: ${n}%"></div>
                </div>
            </div>
        `)}if(e.syncStreams?.length)for(let n of e.syncStreams){let e=n.progress,r=n.subscription?.name??`Sync stream`;if(e){let n=Math.round(e.downloadedFraction*100);t.push(`
                    <article class="sync-status-item">
                        <p class="sync-status-item-detail">${y(r)}</p>
                        <p class="sync-status-item-meta">${e.downloadedOperations} / ${e.totalOperations} (${n}%)</p>
                    </article>
                `)}else t.push(`
                    <article class="sync-status-item">
                        <p class="sync-status-item-detail">${y(r)}</p>
                        <p class="sync-status-item-meta">Idle</p>
                    </article>
                `)}n.downloading||t.push(`
            <article class="sync-status-item sync-status-item--summary">
                <p class="sync-status-item-detail">${e.hasSynced?`Up to date`:`Waiting for first sync`}</p>
                <p class="sync-status-item-meta">Last synced: ${h(e.lastSyncedAt)}</p>
                ${e.bookingCount==null?``:`<p class="sync-status-item-meta">${e.bookingCount} booking(s) stored locally</p>`}
            </article>
        `);let r=a();if(r.length>0){t.push(`<h3 class="sync-status-activity-heading">Recent download activity</h3>`);for(let e of r)t.push(`
                <article class="sync-status-item">
                    <p class="sync-status-item-detail">${h(e.at)}</p>
                    <p class="sync-status-item-meta">${e.operations==null?`Download completed`:`${e.operations} operations received`}</p>
                </article>
            `)}n.uploading&&t.unshift(`<p class="sync-status-active-label">Uploading changes…</p>`),u.innerHTML=t.length?t.join(``):`<p class="sync-status-empty">No download activity</p>`}function C(e){let t=[],n=e.dataFlowStatus??{};n.downloadError&&t.push(`
            <article class="sync-status-issue sync-status-issue--error">
                <p class="sync-status-issue-type">Download error</p>
                <p class="sync-status-issue-message">${y(n.downloadError.message??String(n.downloadError))}</p>
            </article>
        `),n.uploadError&&t.push(`
            <article class="sync-status-issue sync-status-issue--error">
                <p class="sync-status-issue-type">Upload error</p>
                <p class="sync-status-issue-message">${y(n.uploadError.message??String(n.uploadError))}</p>
            </article>
        `),e.syncConfigured&&!e.hasRestaurant&&t.push(`
            <article class="sync-status-issue sync-status-issue--warning">
                <p class="sync-status-issue-type">Restaurant not assigned</p>
                <p class="sync-status-issue-message">Your account has no restaurant_id. Sync cannot start until an admin assigns one.</p>
            </article>
        `),e.syncConfigured||t.push(`
            <article class="sync-status-issue sync-status-issue--warning">
                <p class="sync-status-issue-type">Local-only mode</p>
                <p class="sync-status-issue-message">VITE_POWERSYNC_URL is not configured. Data stays in the browser only.</p>
            </article>
        `),e.uploadQueueCount>0&&e.online&&t.push(`
            <article class="sync-status-issue sync-status-issue--warning">
                <p class="sync-status-issue-type">Pending uploads</p>
                <p class="sync-status-issue-message">${e.uploadQueueCount} change(s) waiting to upload.</p>
            </article>
        `);let r=i();for(let e of r)t.push(`
            <article class="sync-status-issue sync-status-issue--${e.type.includes(`discarded`)?`error`:`warning`}">
                <p class="sync-status-issue-type">${y(e.type.replace(/_/g,` `))}</p>
                <p class="sync-status-issue-message">${y(e.message)}</p>
                <p class="sync-status-issue-meta">${h(e.at)}</p>
            </article>
        `);d.innerHTML=t.length?t.join(``):`<p class="sync-status-empty">No issues detected</p>`}function w(e){v(e),x(e),S(e),C(e)}r(w);