import"./style-TQHRvbNd.js";import"./register-CxERNST-.js";import{m as e,o as t}from"./accounts-Ba5wxbSs.js";import{n,r}from"./accountSwitcher-CGaxRSSb.js";import{n as i,t as a}from"./footer-ChAm13O1.js";import{n as o,t as s}from"./db-k0F-LcVR.js";import{b as c,c as l,d as u,f as d,h as f,l as p,m,n as h,o as g,p as _,r as v,s as ee,t as te,v as y}from"./bookings-Deon4TkP.js";import{t as b}from"./bookingSidebar-yUJiKNtq.js";import{i as x,r as S,t as C}from"./paxSummary-Bwfxgj0V.js";i(document.getElementById(`site-navbar-mount`),{basePath:`../`,showAuthControls:!0,showSyncIndicator:!0}),a(document.getElementById(`site-footer-mount`),{basePath:`../`}),b(document.getElementById(`booking-sidebar-mount`));var w=document.getElementById(`booking-list`),T=document.getElementById(`booking-notice`),E=document.getElementById(`booking-header-pax`),D=document.getElementById(`booking-date-picker`),O=document.getElementById(`booking-date-dropdown`),k=document.getElementById(`booking-date-dropdown-list`),A=document.getElementById(`booking-date-today`),j=14,ne=r({requireAuth:!0,loginRedirect:`../login.html`,onSwitch:()=>$()}),M=await o();function N(){let e=new Date;return e.setHours(0,0,0,0),e}function P(e){let t=new Date(e);return t.setHours(0,0,0,0),t}function F(e,t){let n=new Date(e);return n.setDate(n.getDate()+t),n}function I(e){let t=P(e);return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,`0`)}-${String(t.getDate()).padStart(2,`0`)}`}function re(e){if(!/^\d{4}-\d{2}-\d{2}$/.test(e))return null;let t=new Date(`${e}T00:00:00`);return Number.isNaN(t.getTime())?null:t}function L(e,t){return I(e)===I(t)}function R(){return re(localStorage.getItem(e.MANAGER_SELECTED_DATE))??N()}function z(t){localStorage.setItem(e.MANAGER_SELECTED_DATE,I(t))}function B(e){return e.toLocaleDateString(`en-AU`,{weekday:`short`,day:`numeric`,month:`short`,year:`numeric`})}function V(e){let t=new Date(e);t.setHours(0,0,0,0);let n=new Date(t);return n.setDate(n.getDate()+1),{start:t,end:n}}var H=R(),U=null;G();function W(){O.hidden=!0,D.setAttribute(`aria-expanded`,`false`)}function G(){A.disabled=L(H,N())}function K(e,t){let n=new Map;for(let e=-14;e<=j;e+=1)n.set(I(F(t,e)),g());for(let t of e){let e=_(t.datetime),r=n.get(e);r&&te(r,t)}return n}async function q(e){let t=F(e,-14),r=F(e,15);return M.getAll(`SELECT * FROM bookings
         WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
         ORDER BY datetime`,[n(),y(t),y(r)])}async function J(){let e=N(),n=I(H),r=new Map;t()&&(r=K(await q(H),H)),k.innerHTML=``;for(let t=-14;t<=j;t+=1){let i=F(H,t),a=I(i),{dayTotal:o,lunch:s,dinner:c}=r.get(a)??g(),l=document.createElement(`button`);l.type=`button`,l.className=`booking-date-option`,l.role=`option`,l.innerHTML=`
            <span class="booking-date-option-label">${B(i)}</span>
            <span class="booking-date-option-pax">${C({dayTotal:o,lunch:s,dinner:c})}</span>
        `,a===n?(l.classList.add(`is-selected`),l.setAttribute(`aria-selected`,`true`)):l.setAttribute(`aria-selected`,`false`),L(i,e)&&l.classList.add(`is-today`),l.addEventListener(`click`,e=>{e.stopPropagation(),Z(i)}),k.appendChild(l)}}async function Y(){await J(),O.hidden=!1,D.setAttribute(`aria-expanded`,`true`),k.querySelector(`.booking-date-option.is-selected`)?.scrollIntoView({block:`nearest`})}async function X(){O.hidden?await Y():W()}function Z(e){H=P(e),z(H),G(),W(),$()}function ie(){Z(N())}D.addEventListener(`click`,e=>{e.stopPropagation(),X()}),D.addEventListener(`keydown`,e=>{e.key===`Enter`||e.key===` `?(e.preventDefault(),X()):e.key===`Escape`&&W()}),O.addEventListener(`click`,e=>{e.stopPropagation()}),A.addEventListener(`click`,e=>{e.stopPropagation(),ie()}),document.addEventListener(`click`,()=>{W()}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&W()}),document.getElementById(`booking-list-date-left`).addEventListener(`click`,()=>{Z(F(H,-1))}),document.getElementById(`booking-list-date-right`).addEventListener(`click`,()=>{Z(F(H,1))});function ae(e){let t=new Map;for(let n of e){let e=f(n.datetime),r=t.get(e)??ee();h(r,n),t.set(e,r)}return t}function Q(e,t,n){let r=`timeslot-group-${e}`,i=document.getElementById(r);if(!i){i=document.createElement(`section`),i.id=r,i.className=`booking-timeslot-group`;let e=document.createElement(`div`);e.className=`booking-timeslot-heading`,e.innerHTML=`
        <div class="booking-summary-primary">
            <span class="booking-timeslot-time">${p(t)}</span>
            <span class="booking-summary-pax">${S(n)}</span>
        </div>`;let a=document.createElement(`div`);a.className=`booking-timeslot-items`,i.append(e,a),w.appendChild(i)}return i.querySelector(`.booking-timeslot-items`)}async function oe(e,t){let r=m(t);await c(M,e,n(),r)}function se(e,t){let n=document.getElementById(`booking-list-header`);n.textContent=e.toLocaleDateString(`en-AU`,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`});let{dayTotal:r,lunch:i,dinner:a}=v(t);E.innerHTML=C({dayTotal:r,lunch:i,dinner:a}),E.hidden=!1}function ce(e,t){if(se(t,e),e.length===0){w.innerHTML=`<p>No bookings for today</p>`;return}w.innerHTML=``;let r=ae(e);e.forEach(e=>{let t=f(e.datetime),i=Q(t,e.datetime,r.get(t)),a=``;e.preference!==`none`&&(a=`<div class="booking-detail-preference">${e.preference.charAt(0).toUpperCase()+e.preference.slice(1)}</div>`);let o=u(e.status),s=d(e.status),c=`<button type="button" class="booking-detail-status ${o}" data-id="${e.id}">${s}</button>`,m=document.createElement(`div`);m.className=`booking-list-item-card`,m.innerHTML=`
            <div class="booking-summary-primary">
                <div class="booking-detail-time-preference">
                    <span class="booking-summary-name">${e.first_name} ${e.last_name}</span>
                    ${a}
                </div>
                <span class="booking-summary-time">${p(e.datetime)}</span>
                <span class="booking-summary-pax">
                    ${S(e)}
                    ${c}
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
        `,m.addEventListener(`click`,()=>{m.querySelector(`.booking-list-item-details`).classList.toggle(`is-expanded`)}),m.querySelector(`.booking-detail-status`).addEventListener(`click`,async t=>{t.stopPropagation(),await oe(t.currentTarget.getAttribute(`data-id`),e.status)}),m.querySelector(`.booking-action-delete`).addEventListener(`click`,async t=>{t.stopPropagation(),confirm(`Are you sure you want to delete this booking?`)&&await l(M,e.id,n())}),m.querySelector(`.booking-action-edit`).addEventListener(`click`,e=>{e.stopPropagation();let t=e.target.getAttribute(`data-id`);window.location.href=`create.html?edit=${t}`}),i.appendChild(m)});let{dayTotal:i,lunch:a,dinner:o}=v(e),s=document.createElement(`section`);s.className=`booking-timeslot-group booking-day-total`,s.innerHTML=`
        <div class="booking-timeslot-heading">
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Lunch Total Pax</span>
                ${x(a)}
            </div>
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Dinner Total Pax</span>
                ${x(o)}
            </div>
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Total Pax</span>
                ${x(i)}
            </div>
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Total Bookings</span>
                ${e.length}
            </div>
        </div>
    `,w.appendChild(s)}function le(){T.hidden=!1,T.textContent=`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.`,w.innerHTML=``,document.getElementById(`booking-list-header`).textContent=`Bookings unavailable`,E.hidden=!0,E.innerHTML=``}async function $(){if(U&&=(await U.close(),null),!t()){le();return}T.hidden=!0;let e=H,{start:r,end:i}=V(e),a=n();U=M.query({sql:`SELECT * FROM bookings
                  WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
                  ORDER BY datetime, last_name`,parameters:[a,y(r),y(i)]}).watch(),U.registerListener({onData:t=>ce(t,e)})}await ne,await $(),s(M);