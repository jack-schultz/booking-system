import"./style-D84SsKEL.js";import{t as e}from"./navbar-8TJY0WqY.js";import{n as t}from"./accountSwitcher-DSipr2h4.js";import{t as n}from"./db-Bs-6G73g.js";import{a as r,n as i,r as a,s as o}from"./bookings-PBa46hCe.js";import{t as s}from"./bookingSidebar-DRkGenzl.js";e(document.getElementById(`site-navbar-mount`),{basePath:`../`,showAuthControls:!0}),s(document.getElementById(`booking-sidebar-mount`));var c=document.getElementById(`booking-list`),l=t({requireAuth:!0,loginRedirect:`../login.html`}),u=await n();function d(){return new Date().toISOString().split(`T`)[0]}async function f(){let e=await r(u,d());if(e.length===0){c.innerHTML=`<p>No bookings for today</p>`;return}c.innerHTML=``,e.forEach(e=>{let t=o(e.datetime);if(!document.getElementById(t)){let n=document.createElement(`div`);n.textContent=a(e.datetime),n.id=t,n.className=`booking-timeslot-heading`,c.appendChild(n)}let n=document.createElement(`div`);n.className=`booking-list-item-card`,n.innerHTML=`
            <div class="booking-list-item-summary">
                <strong>${e.first_name} ${e.last_name}</strong> for
                <strong>${e.total_pax}</strong> PAX (${e.adult_pax}, ${e.child_pax}, ${e.hc_pax})
                Preference: <strong>${e.preference}</strong>
            </div>

            <div class="booking-list-item-details">
                <p><strong>Total Pax</strong>: <strong>${e.total_pax}</strong> (<strong>${e.adult_pax}</strong> Adults, <strong>${e.child_pax}</strong> Children, <strong>${e.hc_pax}</strong> HC)</p>
                <p><strong>Time</strong>: ${a(e.datetime)}</p>
                <p><strong>Phone</strong>: ${e.phone_number??`-`}</p>
                <p><strong>Email</strong>: ${e.email||`-`}</p>
                <p><strong>Preference</strong>: ${e.preference}</p>
                <p><strong>Notes</strong>: ${e.notes||`-`}</p>

                <div class="booking-actions-row">
                    <button class="booking-action-edit" data-id="${e.id}">Edit</button>
                    <button class="booking-action-delete" data-id="${e.id}">Delete</button>
                </div>
            </div>
        `,n.querySelector(`.booking-list-item-summary`).addEventListener(`click`,()=>{n.querySelector(`.booking-list-item-details`).classList.toggle(`is-expanded`)}),n.querySelector(`.booking-action-delete`).addEventListener(`click`,async t=>{t.stopPropagation(),confirm(`Are you sure you want to delete this booking?`)&&(await i(u,e.id),await f())}),n.querySelector(`.booking-action-edit`).addEventListener(`click`,e=>{e.stopPropagation();let t=e.target.getAttribute(`data-id`);window.location.href=`create.html?edit=${t}`}),c.appendChild(n)})}await l,await f();