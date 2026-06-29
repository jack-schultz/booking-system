import"./style-J9WVJV5r.js";import{t as e}from"./navbar-BSSVuDwV.js";import{n as t,r as n}from"./accountSwitcher-BFZqxLUk.js";import{t as r}from"./db-DJNLFU5N.js";import{a as i,n as a,r as o,s}from"./bookings-C-Wy-PGC.js";import{t as c}from"./bookingSidebar-DRkGenzl.js";e(document.getElementById(`site-navbar-mount`),{basePath:`../`,showAuthControls:!0}),c(document.getElementById(`booking-sidebar-mount`));var l=document.getElementById(`booking-list`),u=n({requireAuth:!0,loginRedirect:`../login.html`,onSwitch:()=>m()}),d=await r();function f(){return new Date().toISOString().split(`T`)[0]}function p(e,t){let n=`timeslot-group-${e}`,r=document.getElementById(n);if(!r){r=document.createElement(`section`),r.id=n,r.className=`booking-timeslot-group`;let e=document.createElement(`div`);e.className=`booking-timeslot-heading`,e.textContent=o(t);let i=document.createElement(`div`);i.className=`booking-timeslot-items`,r.append(e,i),l.appendChild(r)}return r.querySelector(`.booking-timeslot-items`)}async function m(){let e=await i(d,f(),t());if(e.length===0){l.innerHTML=`<p>No bookings for today</p>`;return}l.innerHTML=``,e.forEach(e=>{let n=p(s(e.datetime),e.datetime),r=document.createElement(`div`);r.className=`booking-list-item-card`,r.innerHTML=`
            <div class="booking-summary-primary">
                <div class="booking-detail-time-preference">
                    <span class="booking-summary-name">${e.first_name} ${e.last_name}</span>
                    <div class="booking-detail-preference">${e.preference.charAt(0).toUpperCase()+e.preference.slice(1)}</div>
                </div>
                <span class="booking-summary-time">${o(e.datetime)}</span>
                <span class="booking-summary-pax">
                    <span class="booking-summary-pax-total">${e.total_pax}</span>
                    <span class="booking-summary-pax-breakdown">
                        <span>${e.adult_pax}A</span>
                        <span>${e.child_pax}C</span>
                        <span>${e.hc_pax}HC</span>
                    </span>
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
        `,r.addEventListener(`click`,()=>{r.querySelector(`.booking-list-item-details`).classList.toggle(`is-expanded`)}),r.querySelector(`.booking-action-delete`).addEventListener(`click`,async n=>{n.stopPropagation(),confirm(`Are you sure you want to delete this booking?`)&&(await a(d,e.id,t()),await m())}),r.querySelector(`.booking-action-edit`).addEventListener(`click`,e=>{e.stopPropagation();let t=e.target.getAttribute(`data-id`);window.location.href=`create.html?edit=${t}`}),n.appendChild(r)})}await u,await m();