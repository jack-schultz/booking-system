import"./style-B9PfBaKX.js";import{t as e}from"./navbar-BSSVuDwV.js";import{n as t,r as n}from"./accountSwitcher-BFZqxLUk.js";import{t as r}from"./db-DJNLFU5N.js";import{a as i,n as a,r as o,s}from"./bookings-C-Wy-PGC.js";import{t as c}from"./bookingSidebar-DRkGenzl.js";e(document.getElementById(`site-navbar-mount`),{basePath:`../`,showAuthControls:!0}),c(document.getElementById(`booking-sidebar-mount`));var l=document.getElementById(`booking-list`),u=n({requireAuth:!0,loginRedirect:`../login.html`,onSwitch:()=>p()}),d=await r();function f(){return new Date().toISOString().split(`T`)[0]}async function p(){let e=await i(d,f(),t());if(e.length===0){l.innerHTML=`<p>No bookings for today</p>`;return}l.innerHTML=``,e.forEach(e=>{let n=s(e.datetime);if(!document.getElementById(n)){let t=document.createElement(`div`);t.textContent=o(e.datetime),t.id=n,t.className=`booking-timeslot-heading`,l.appendChild(t)}let r=document.createElement(`div`);r.className=`booking-list-item-card`,r.innerHTML=`
            <div class="booking-list-item-summary">
                <strong>${e.first_name} ${e.last_name}</strong> for
                <strong>${e.total_pax}</strong> PAX (${e.adult_pax}, ${e.child_pax}, ${e.hc_pax})
                Preference: <strong>${e.preference}</strong>
            </div>

            <div class="booking-list-item-details">
                <p><strong>Total Pax</strong>: <strong>${e.total_pax}</strong> (<strong>${e.adult_pax}</strong> Adults, <strong>${e.child_pax}</strong> Children, <strong>${e.hc_pax}</strong> HC)</p>
                <p><strong>Time</strong>: ${o(e.datetime)}</p>
                <p><strong>Phone</strong>: ${e.phone_number??`-`}</p>
                <p><strong>Email</strong>: ${e.email||`-`}</p>
                <p><strong>Preference</strong>: ${e.preference}</p>
                <p><strong>Notes</strong>: ${e.notes||`-`}</p>

                <div class="booking-actions-row">
                    <button class="booking-action-edit" data-id="${e.id}">Edit</button>
                    <button class="booking-action-delete" data-id="${e.id}">Delete</button>
                </div>
            </div>
        `,r.querySelector(`.booking-list-item-summary`).addEventListener(`click`,()=>{r.querySelector(`.booking-list-item-details`).classList.toggle(`is-expanded`)}),r.querySelector(`.booking-action-delete`).addEventListener(`click`,async n=>{n.stopPropagation(),confirm(`Are you sure you want to delete this booking?`)&&(await a(d,e.id,t()),await p())}),r.querySelector(`.booking-action-edit`).addEventListener(`click`,e=>{e.stopPropagation();let t=e.target.getAttribute(`data-id`);window.location.href=`create.html?edit=${t}`}),l.appendChild(r)})}await u,await p();