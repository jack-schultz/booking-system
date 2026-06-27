import{t as e}from"./supabaseClient-DVJvaHM5.js";/* empty css              */import{t}from"./db-CyX7kZGR.js";import{a as n,n as r,r as i,s as a}from"./bookings-RSDP0zsH.js";var o=document.getElementById(`booking-list`),s=await t();function c(){return new Date().toISOString().split(`T`)[0]}async function l(){let e=await n(s,c());if(e.length===0){o.innerHTML=`<p>No bookings for today</p>`;return}o.innerHTML=``,e.forEach(e=>{let t=a(e.datetime);if(!document.getElementById(t)){let n=document.createElement(`div`);n.textContent=i(e.datetime),n.id=t,n.className=`timeslot-display`,o.appendChild(n)}let n=document.createElement(`div`);n.className=`content-card`,n.innerHTML=`
                <div class="booking-summary" style="cursor:pointer;">
                    <strong>${e.first_name} ${e.last_name}</strong> for
                    <strong>${e.total_pax}</strong> PAX (${e.adult_pax}, ${e.child_pax}, ${e.hc_pax})
                    Preference: <strong>${e.preference}</strong>
                </div>

                <div class="booking-details" style="display:none; margin-top:10px;">
                    <p><strong>Total Pax</strong>: <strong>${e.total_pax}</strong> (<strong>${e.adult_pax}</strong> Adults, <strong>${e.child_pax}</strong> Children, <strong>${e.hc_pax}</strong> HC)</p>
                    <p><strong>Time</strong>: ${i(e.datetime)}</p>
                    <p><strong>Phone</strong>: ${e.phone_number??`-`}</p>
                    <p><strong>Email</strong>: ${e.email||`-`}</p>
                    <p><strong>Preference</strong>: ${e.preference}</p>
                    <p><strong>Notes</strong>: ${e.notes||`-`}</p>

                    <div class="button-wrapper">
                        <button class="edit-button" data-id="${e.id}">Edit</button>
                        <button class="delete-button" data-id="${e.id}">Delete</button>
                    </div>
                </div>
            `,n.querySelector(`.booking-summary`).addEventListener(`click`,()=>{let e=n.querySelector(`.booking-details`);e.style.display=e.style.display===`none`?`block`:`none`}),n.querySelector(`.delete-button`).addEventListener(`click`,async t=>{t.stopPropagation(),confirm(`Are you sure you want to delete this booking?`)&&(await r(s,e.id),await l())}),n.querySelector(`.edit-button`).addEventListener(`click`,e=>{e.stopPropagation();let t=e.target.getAttribute(`data-id`);window.location.href=`create.html?edit=${t}`}),o.appendChild(n)})}document.getElementById(`logoutBtn`).addEventListener(`click`,async()=>{await e.auth.signOut(),window.location.href=`../login.html`});async function u(){let{data:{user:t}}=await e.auth.getUser();if(!t){window.location.href=`../login.html`;return}document.getElementById(`logged_in_user`).innerHTML=t.email,await l()}u();