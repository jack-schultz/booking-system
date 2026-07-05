import{n as e,t}from"./footer-BPRjeWN9.js";import"./register-BgmyEqJt.js";import{o as n}from"./accounts-CAIbdN4Z.js";import{n as r,r as i}from"./accountSwitcher-DjqSVm1Z.js";import{n as a,t as o}from"./db-iPnXzGMh.js";import{a as s,c,d as l,l as u,n as d,o as f,p,r as m}from"./bookings-PsV5qE0F.js";import{t as h}from"./bookingSidebar-yUJiKNtq.js";e(document.getElementById(`site-navbar-mount`),{basePath:`../`,showAuthControls:!0,showSyncIndicator:!0}),t(document.getElementById(`site-footer-mount`),{basePath:`../`}),h(document.getElementById(`booking-sidebar-mount`));var g=document.getElementById(`booking-list`),_=document.getElementById(`booking-notice`),v=i({requireAuth:!0,loginRedirect:`../login.html`,onSwitch:()=>O()}),y=await a();function b(e=0){let t=new Date;return t.setDate(t.getDate()+e),t.setHours(0,0,0,0),t}function x(e){let t=new Date(e);t.setHours(0,0,0,0);let n=new Date(t);return n.setDate(n.getDate()+1),{start:t,end:n}}var S=0,C=null;document.getElementById(`booking-list-date-left`).addEventListener(`click`,()=>{--S,O()}),document.getElementById(`booking-list-date-right`).addEventListener(`click`,()=>{S+=1,O()});function w(e,t){let n=`timeslot-group-${e}`,r=document.getElementById(n);if(!r){r=document.createElement(`section`),r.id=n,r.className=`booking-timeslot-group`;let e=document.createElement(`div`);e.className=`booking-timeslot-heading`,e.textContent=m(t);let i=document.createElement(`div`);i.className=`booking-timeslot-items`,r.append(e,i),g.appendChild(r)}return r.querySelector(`.booking-timeslot-items`)}async function T(e,t){let n=c(t);await p(y,e,r(),n)}function E(e,t){let n=document.getElementById(`booking-list-header`);if(n.textContent=t.toLocaleDateString(`en-AU`,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`}),e.length===0){g.innerHTML=`<p>No bookings for today</p>`;return}g.innerHTML=``,e.forEach(e=>{let t=w(u(e.datetime),e.datetime),n=``;e.preference!==`none`&&(n=`<div class="booking-detail-preference">${e.preference.charAt(0).toUpperCase()+e.preference.slice(1)}</div>`);let i=s(e.status),a=f(e.status),o=`<button type="button" class="booking-detail-status ${i}" data-id="${e.id}">${a}</button>`,c=document.createElement(`div`);c.className=`booking-list-item-card`,c.innerHTML=`
            <div class="booking-summary-primary">
                <div class="booking-detail-time-preference">
                    <span class="booking-summary-name">${e.first_name} ${e.last_name}</span>
                    ${n}
                </div>
                <span class="booking-summary-time">${m(e.datetime)}</span>
                <span class="booking-summary-pax">
                    <span class="booking-summary-pax-total">${e.total_pax}</span>
                    <span class="booking-summary-pax-breakdown">
                        <span>${e.adult_pax}A</span>
                        <span>${e.child_pax}C</span>
                        <span>${e.hc_pax}HC</span>
                    </span>
                    ${o}
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
        `,c.addEventListener(`click`,()=>{c.querySelector(`.booking-list-item-details`).classList.toggle(`is-expanded`)}),c.querySelector(`.booking-detail-status`).addEventListener(`click`,async t=>{t.stopPropagation(),await T(t.currentTarget.getAttribute(`data-id`),e.status)}),c.querySelector(`.booking-action-delete`).addEventListener(`click`,async t=>{t.stopPropagation(),confirm(`Are you sure you want to delete this booking?`)&&await d(y,e.id,r())}),c.querySelector(`.booking-action-edit`).addEventListener(`click`,e=>{e.stopPropagation();let t=e.target.getAttribute(`data-id`);window.location.href=`create.html?edit=${t}`}),t.appendChild(c)})}function D(){_.hidden=!1,_.textContent=`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.`,g.innerHTML=``,document.getElementById(`booking-list-header`).textContent=`Bookings unavailable`}async function O(){if(C&&=(await C.close(),null),!n()){D();return}_.hidden=!0;let e=b(S),{start:t,end:i}=x(e),a=r();C=y.query({sql:`SELECT * FROM bookings
                  WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
                  ORDER BY datetime, last_name`,parameters:[a,l(t),l(i)]}).watch(),C.registerListener({onData:t=>E(t,e)})}await v,await O(),o(y);