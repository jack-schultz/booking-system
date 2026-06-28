import"./modulepreload-polyfill-Dezn_h7o.js";/* empty css              */import{n as e}from"./accountSwitcher-Dl6Gz46P.js";import{t}from"./db-CyX7kZGR.js";import{a as n,n as r,r as i,s as a}from"./bookings-RSDP0zsH.js";var o=document.getElementById(`booking-list`),s=e({requireAuth:!0,loginRedirect:`../login.html`}),c=await t();function l(){return new Date().toISOString().split(`T`)[0]}async function u(){let e=await n(c,l());if(e.length===0){o.innerHTML=`<p>No bookings for today</p>`;return}o.innerHTML=``,e.forEach(e=>{let t=a(e.datetime);if(!document.getElementById(t)){let n=document.createElement(`div`);n.textContent=i(e.datetime),n.id=t,n.className=`booking-timeslot-heading`,o.appendChild(n)}let n=document.createElement(`div`);n.className=`booking-list-item-card`,n.innerHTML=`
                <div class="booking-list-item-summary">
                    <strong>${e.first_name} ${e.last_name}</strong> for
                    <strong>${e.total_pax}</strong> PAX (${e.adult_pax}, ${e.child_pax}, ${e.hc_pax})
                    Preference: <strong>${e.preference}</strong>
                </div>

                <div class="booking-list-item-details">
                    <p><strong>Total Pax</strong>: <strong>${e.total_pax}</strong> (<strong>${e.adult_pax}</strong> Adults, <strong>${e.child_pax}</strong> Children, <strong>${e.hc_pax}</strong> HC)</p>
                    <p><strong>Time</strong>: ${i(e.datetime)}</p>
                    <p><strong>Phone</strong>: ${e.phone_number??`-`}</p>
                    <p><strong>Email</strong>: ${e.email||`-`}</p>
                    <p><strong>Preference</strong>: ${e.preference}</p>
                    <p><strong>Notes</strong>: ${e.notes||`-`}</p>

                    <div class="booking-actions-row">
                        <button class="booking-action-edit" data-id="${e.id}">Edit</button>
                        <button class="booking-action-delete" data-id="${e.id}">Delete</button>
                    </div>
                </div>
            `,n.querySelector(`.booking-list-item-summary`).addEventListener(`click`,()=>{n.querySelector(`.booking-list-item-details`).classList.toggle(`is-expanded`)}),n.querySelector(`.booking-action-delete`).addEventListener(`click`,async t=>{t.stopPropagation(),confirm(`Are you sure you want to delete this booking?`)&&(await r(c,e.id),await u())}),n.querySelector(`.booking-action-edit`).addEventListener(`click`,e=>{e.stopPropagation();let t=e.target.getAttribute(`data-id`);window.location.href=`create.html?edit=${t}`}),o.appendChild(n)})}async function d(){await s,await u()}d();