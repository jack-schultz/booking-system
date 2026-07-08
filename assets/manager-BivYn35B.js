import{n as e,t}from"./footer-9jXkGN1J.js";import"./register-C68K_GfI.js";import{o as n}from"./accounts-Br4GLleJ.js";import{n as r,r as i}from"./accountSwitcher-oG_dRl8B.js";import{n as a,t as o}from"./db-CovA7E6O.js";import{h as s,i as c,l,o as u,p as d,r as f,s as p,u as m}from"./bookings-DZ1TBEMF.js";import{t as h}from"./bookingSidebar-yUJiKNtq.js";e(document.getElementById(`site-navbar-mount`),{basePath:`../`,showAuthControls:!0,showSyncIndicator:!0}),t(document.getElementById(`site-footer-mount`),{basePath:`../`}),h(document.getElementById(`booking-sidebar-mount`));var g=document.getElementById(`booking-list`),_=document.getElementById(`booking-notice`),v=i({requireAuth:!0,loginRedirect:`../login.html`,onSwitch:()=>k()}),y=await a();function b(e=0){let t=new Date;return t.setDate(t.getDate()+e),t.setHours(0,0,0,0),t}function x(e){let t=new Date(e);t.setHours(0,0,0,0);let n=new Date(t);return n.setDate(n.getDate()+1),{start:t,end:n}}var S=0,C=null;document.getElementById(`booking-list-date-left`).addEventListener(`click`,()=>{--S,k()}),document.getElementById(`booking-list-date-right`).addEventListener(`click`,()=>{S+=1,k()});function w(e){let t=new Map;for(let n of e){let e=m(n.datetime),r=t.get(e)??{total_pax:0,adult_pax:0,child_pax:0,hc_pax:0};r.total_pax+=n.total_pax,r.adult_pax+=n.adult_pax,r.child_pax+=n.child_pax,r.hc_pax+=n.hc_pax,t.set(e,r)}return t}function T(e,t,n){let r=`timeslot-group-${e}`,i=document.getElementById(r);if(!i){i=document.createElement(`section`),i.id=r,i.className=`booking-timeslot-group`;let e=document.createElement(`div`);e.className=`booking-timeslot-heading`;let{total_pax:a,adult_pax:o,child_pax:s,hc_pax:l}=n;e.innerHTML=`
        <div class="booking-summary-primary">
            <span class="booking-timeslot-time">${c(t)}</span>
            <span class="booking-summary-pax">
                <span class="booking-summary-pax-total">${a}</span>
                <span class="booking-summary-pax-breakdown">
                    <span>${o}A</span>
                    <span>${s}C</span>
                    <span>${l}HC</span>
                </span>
            </span>
        </div>`;let u=document.createElement(`div`);u.className=`booking-timeslot-items`,i.append(e,u),g.appendChild(i)}return i.querySelector(`.booking-timeslot-items`)}async function E(e,t){let n=l(t);await s(y,e,r(),n)}function D(e,t){let n=document.getElementById(`booking-list-header`);if(n.textContent=t.toLocaleDateString(`en-AU`,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`}),e.length===0){g.innerHTML=`<p>No bookings for today</p>`;return}g.innerHTML=``;let i=w(e);e.forEach(e=>{let t=m(e.datetime),n=T(t,e.datetime,i.get(t)),a=``;e.preference!==`none`&&(a=`<div class="booking-detail-preference">${e.preference.charAt(0).toUpperCase()+e.preference.slice(1)}</div>`);let o=u(e.status),s=p(e.status),l=`<button type="button" class="booking-detail-status ${o}" data-id="${e.id}">${s}</button>`,d=document.createElement(`div`);d.className=`booking-list-item-card`,d.innerHTML=`
            <div class="booking-summary-primary">
                <div class="booking-detail-time-preference">
                    <span class="booking-summary-name">${e.first_name} ${e.last_name}</span>
                    ${a}
                </div>
                <span class="booking-summary-time">${c(e.datetime)}</span>
                <span class="booking-summary-pax">
                    <span class="booking-summary-pax-total">${e.total_pax}</span>
                    <span class="booking-summary-pax-breakdown">
                        <span>${e.adult_pax}A</span>
                        <span>${e.child_pax}C</span>
                        <span>${e.hc_pax}HC</span>
                    </span>
                    ${l}
                </span>
            </div>

            <div class="booking-list-item-details">
                <div class="booking-detail-grid">
                    <div class="booking-detail-contact">
                        ${e.phone_number?`<a class="booking-detail-phone" href="tel:${e.phone_number}">${e.phone_number}</a>`:`<span class="booking-detail-phone booking-detail-empty">—</span>`}
                        ${e.email?`<a class="booking-detail-email" href="mailto:${e.email}">${e.email}</a>`:`<span class="booking-detail-email booking-detail-empty">No Email</span>`}
                    </div>
                    
                    <div class="booking-detail-notes${e.notes?``:` is-empty`}">${e.notes||`No notes`}</div>
                </div>

                <div class="booking-actions-row">
                    <button class="booking-action-edit" data-id="${e.id}">Edit</button>
                    <button class="booking-action-delete" data-id="${e.id}">Delete</button>
                </div>
            </div>
        `,d.addEventListener(`click`,()=>{d.querySelector(`.booking-list-item-details`).classList.toggle(`is-expanded`)}),d.querySelector(`.booking-detail-status`).addEventListener(`click`,async t=>{t.stopPropagation(),await E(t.currentTarget.getAttribute(`data-id`),e.status)}),d.querySelector(`.booking-action-delete`).addEventListener(`click`,async t=>{t.stopPropagation(),confirm(`Are you sure you want to delete this booking?`)&&await f(y,e.id,r())}),d.querySelector(`.booking-action-edit`).addEventListener(`click`,e=>{e.stopPropagation();let t=e.target.getAttribute(`data-id`);window.location.href=`create.html?edit=${t}`}),n.appendChild(d)})}function O(){_.hidden=!1,_.textContent=`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.`,g.innerHTML=``,document.getElementById(`booking-list-header`).textContent=`Bookings unavailable`}async function k(){if(C&&=(await C.close(),null),!n()){O();return}_.hidden=!0;let e=b(S),{start:t,end:i}=x(e),a=r();C=y.query({sql:`SELECT * FROM bookings
                  WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
                  ORDER BY datetime, last_name`,parameters:[a,d(t),d(i)]}).watch(),C.registerListener({onData:t=>D(t,e)})}await v,await k(),o(y);