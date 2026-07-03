import{n as e,t}from"./footer-yOzlH7E3.js";import"./register-BJSMtJEJ.js";import{n,r}from"./accountSwitcher-CF0woADG.js";import{t as i}from"./db-oD0rxzJR.js";import{a,l as o,m as s,n as c,o as l,r as u,s as d,u as f}from"./bookings-COa98ppe.js";import{t as p}from"./bookingSidebar-yUJiKNtq.js";e(document.getElementById(`site-navbar-mount`),{basePath:`../`,showAuthControls:!0}),t(document.getElementById(`site-footer-mount`),{basePath:`../`}),p(document.getElementById(`booking-sidebar-mount`));var m=document.getElementById(`booking-list`),h=r({requireAuth:!0,loginRedirect:`../login.html`,onSwitch:()=>x()}),g=await i();function _(e=0){let t=new Date;return t.setDate(t.getDate()+e),t.setHours(0,0,0,0),t}var v=0;document.getElementById(`booking-list-date-left`).addEventListener(`click`,()=>{--v,x()}),document.getElementById(`booking-list-date-right`).addEventListener(`click`,()=>{v+=1,x()});function y(e,t){let n=`timeslot-group-${e}`,r=document.getElementById(n);if(!r){r=document.createElement(`section`),r.id=n,r.className=`booking-timeslot-group`;let e=document.createElement(`div`);e.className=`booking-timeslot-heading`,e.textContent=u(t);let i=document.createElement(`div`);i.className=`booking-timeslot-items`,r.append(e,i),m.appendChild(r)}return r.querySelector(`.booking-timeslot-items`)}async function b(e,t,r){let i=o(t,r);await s(g,e,n(),i),await x()}async function x(){let e=_(v),t=await d(g,e,n()),r=document.getElementById(`booking-list-header`);if(r.textContent=e.toLocaleDateString(`en-AU`,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`}),t.length===0){m.innerHTML=`<p>No bookings for today</p>`;return}m.innerHTML=``,t.forEach(e=>{let t=y(f(e.datetime),e.datetime),r=``;e.preference!==`none`&&(r=`<div class="booking-detail-preference">${e.preference.charAt(0).toUpperCase()+e.preference.slice(1)}</div>`);let i=a(e.status,e.table_set),o=l(e.status,e.table_set),s=`<button type="button" class="booking-detail-status ${i}" data-id="${e.id}">${o}</button>`,d=document.createElement(`div`);d.className=`booking-list-item-card`,d.innerHTML=`
            <div class="booking-summary-primary">
                <div class="booking-detail-time-preference">
                    <span class="booking-summary-name">${e.first_name} ${e.last_name}</span>
                    ${r}
                </div>
                <span class="booking-summary-time">${u(e.datetime)}</span>
                <span class="booking-summary-pax">
                    <span class="booking-summary-pax-total">${e.total_pax}</span>
                    <span class="booking-summary-pax-breakdown">
                        <span>${e.adult_pax}A</span>
                        <span>${e.child_pax}C</span>
                        <span>${e.hc_pax}HC</span>
                    </span>
                    ${s}
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
        `,d.addEventListener(`click`,()=>{d.querySelector(`.booking-list-item-details`).classList.toggle(`is-expanded`)}),d.querySelector(`.booking-detail-status`).addEventListener(`click`,async t=>{t.stopPropagation(),await b(t.currentTarget.getAttribute(`data-id`),e.status,e.table_set)}),d.querySelector(`.booking-action-delete`).addEventListener(`click`,async t=>{t.stopPropagation(),confirm(`Are you sure you want to delete this booking?`)&&(await c(g,e.id,n()),await x())}),d.querySelector(`.booking-action-edit`).addEventListener(`click`,e=>{e.stopPropagation();let t=e.target.getAttribute(`data-id`);window.location.href=`create.html?edit=${t}`}),t.appendChild(d)})}await h,await x();