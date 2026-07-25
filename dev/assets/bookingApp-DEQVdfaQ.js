const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/supabaseClient-jAmk_zrl.js","assets/supabaseClient-Cll7b3zd.js","assets/preload-helper-j_ZwnIYB.js"])))=>i.map(i=>d[i]);
import"./style-CEPcSWMK.js";import{t as e}from"./preload-helper-j_ZwnIYB.js";import"./register-CxERNST-.js";import{g as t,h as n,i as r,n as i,t as a,u as o,y as s}from"./syncStatus-CUus1Ppg.js";import{i as c,n as l,t as u}from"./footer-NbQLN31a.js";import{n as d,r as f,t as p}from"./accountSwitcher-LE1U5bbM.js";import{i as m}from"./sync-D3d_CMNe.js";import{n as h,t as g}from"./db-DZsXyThn.js";import{S as ee,_,a as v,b as te,c as y,d as b,f as x,g as ne,h as re,i as ie,l as ae,m as oe,n as se,o as ce,p as le,r as ue,s as S,t as de,u as fe,v as C,y as pe}from"./bookings-C83OnqHb.js";var me=[{name:`manager`,label:`BOOKINGS`,className:`booking-sidebar-nav-link--bookings`},{name:`create`,label:`NEW BOOKING`,className:`booking-sidebar-nav-link--new-booking`},{name:`walkin`,label:`WALK-IN`,className:`booking-sidebar-nav-link--walk-in`}];function he(e,{activeRoute:t,onNavigate:n,showSaveButton:r=!1}={}){if(!e)return;let i=r?`<button type="submit" form="bookingForm" class="booking-sidebar-nav-link booking-sidebar-nav-link--save">SAVE BOOKING</button>`:``;e.innerHTML=me.map(({name:e,label:n,className:r})=>{let i=t===e;return`<button type="button" class="booking-sidebar-nav-link ${r}${i?` is-active`:``}" data-route="${e}"${i?` aria-current="page"`:``}>${n}</button>`}).join(``)+i,e.querySelectorAll(`[data-route]`).forEach(e=>{e.addEventListener(`click`,()=>{let r=e.getAttribute(`data-route`);r&&r!==t&&n?.(r)})})}function ge(e,t={}){let n=document.createElement(`nav`);n.className=`booking-sidebar-nav`,e.replaceWith(n),he(n,t)}function _e(e={}){he(document.querySelector(`.booking-sidebar-nav`),e)}var ve=new Set,ye=new Set([`manager`,`create`,`walkin`]);function be(e){for(let t of ve)t(e)}function xe(e){let t=document.getElementById(`booking-shell-layout`),n=document.getElementById(`booking-sidebar-panel`),r=ye.has(e);t?.classList.toggle(`booking-page-layout--no-sidebar`,!r),n&&(n.hidden=!r)}async function Se({initialRoute:e,onNavigate:t}){l(document.getElementById(`site-navbar-mount`),{basePath:`../`,activeRoute:e,onNavigate:t}),u(document.getElementById(`site-footer-mount`),{basePath:`../`}),ge(document.getElementById(`booking-sidebar-mount`),{activeRoute:e,onNavigate:t,showSaveButton:e===`create`}),xe(e);let n=f({requireAuth:!0,loginRedirect:`../login.html`,onSwitch:e=>be(e)}),r=await h();return await n,g(r),{db:r,registerOnAccountSwitch(e){return ve.add(e),()=>ve.delete(e)},setActiveRoute(e){xe(e),c({activeRoute:e,onNavigate:t,basePath:`../`}),ye.has(e)&&_e({activeRoute:e,onNavigate:t,showSaveButton:e===`create`})}}}var Ce={manager:`manager`,create:`create`,walkin:`walkin`,metrics:`metrics`,tables:`tables`,"sync-status":`sync-status`},we=/\/booking\/(manager|create|walkin|metrics|tables|sync-status)\/?$/;function w(e=window.location){let t=e.pathname.replace(/\/$/,``),n=new URLSearchParams(e.search).get(`edit`),r=t.match(we)?.[1]??`manager`;return{name:r,editId:r===`create`?n:null}}function Te(e,{edit:t}={}){let n=Ce[e]??Ce.manager,r=new URL(`/booking-system/dev/booking/${n}`,window.location.origin);return t?r.searchParams.set(`edit`,t):r.searchParams.delete(`edit`),`${r.pathname}${r.search}`}function Ee(e){let{db:t,registerOnAccountSwitch:n,setActiveRoute:r,views:i}=e,a=null,o={},s=!1,c={manager:document.getElementById(`view-manager`),create:document.getElementById(`view-create`),walkin:document.getElementById(`view-walkin`),metrics:document.getElementById(`view-metrics`),tables:document.getElementById(`view-tables`),"sync-status":document.getElementById(`view-sync-status`)};function l(e){for(let[t,n]of Object.entries(c))n&&(n.hidden=t!==e)}async function u(e,a={}){let o=i[e];if(!o)throw Error(`Unknown route: ${e}`);l(e),r(e),await o.mount({db:t,registerOnAccountSwitch:n,onNavigate:f,...a})}async function d(){if(!a)return;let e=i[a];e?.unmount&&await e.unmount()}async function f(e,{edit:t,replace:n=!1}={}){if(!s&&!(a===e&&(e!==`create`||(t??null)===o.editId))){s=!0;try{let r=Te(e,{edit:t});n?history.replaceState({route:e,editId:t??null},``,r):history.pushState({route:e,editId:t??null},``,r),await d(),a=e,o={editId:t??null},await u(e,{editId:t??null})}finally{s=!1}}}async function p(){let{name:e,editId:t}=w();a=e,o={editId:t},l(e),r(e),await u(e,{editId:t}),window.addEventListener(`popstate`,async e=>{if(!s){s=!0;try{let t=e.state,n=t?.route??w().name,i=t?.editId??w().editId;await d(),a=n,o={editId:i},l(n),r(n),await u(n,{editId:i})}finally{s=!1}}})}return{start:p,navigate:f}}function T(e){let{total_pax:t,adult_pax:n,child_pax:r,hc_pax:i}=e;return`
        <span class="booking-summary-pax-total">${t}</span>
        <span class="booking-summary-pax-breakdown">
            <span>${n}A</span>
            <span>${r}C</span>
            <span>${i}HC</span>
        </span>
    `}function De(e){return`<span class="booking-summary-pax">${T(e)}</span>`}function E(e){return`<div class="metrics-pax-cell">${T(e)}</div>`}function Oe({dayTotal:e,lunch:t,dinner:n}){return`
        <span class="booking-summary-pax-total">${e.booking_count}-${e.total_pax}</span>
        <span class="booking-summary-pax-breakdown">
            <span>L${t.booking_count}-${t.total_pax}</span>
            <span>D${n.booking_count}-${n.total_pax}</span>
        </span>
    `}function ke(e){return`<span class="booking-summary-pax">${Oe(e)}</span>`}var Ae=12;function D(){let e=new Date;return e.setHours(0,0,0,0),e}function O(e){let t=new Date(e);return t.setHours(0,0,0,0),t}function je(e,t){let n=new Date(e);return n.setDate(n.getDate()+t),n}function k(e){let t=O(e);return t.setDate(1),t}function Me(e,t){let n=k(e);return n.setMonth(n.getMonth()+t),n}function Ne(e){let t=k(e),n=[],r=new Date(t);for(;r.getMonth()===t.getMonth();)n.push(new Date(r)),r.setDate(r.getDate()+1);return n}function Pe(){let e=D(),t=[];for(let n=-1;n<=Ae;n+=1)t.push(Me(e,n));return t}function Fe(e){return{start:k(e[0]),end:Me(k(e[e.length-1]),1)}}function A(e){let t=O(e);return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,`0`)}-${String(t.getDate()).padStart(2,`0`)}`}function Ie(e){let t=O(e);return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,`0`)}`}function Le(e){if(!/^\d{4}-\d{2}-\d{2}$/.test(e))return null;let t=new Date(`${e}T00:00:00`);return Number.isNaN(t.getTime())?null:t}function Re(e,t){return A(e)===A(t)}function ze(){return Le(localStorage.getItem(s.MANAGER_SELECTED_DATE))??D()}function Be(e){localStorage.setItem(s.MANAGER_SELECTED_DATE,A(e))}function Ve(e){return e.toLocaleDateString(`en-AU`,{weekday:`short`,day:`numeric`})}function He(e){return e.toLocaleDateString(`en-AU`,{month:`short`,year:`numeric`})}function Ue(e){let t=new Date(e);t.setHours(0,0,0,0);let n=new Date(t);return n.setDate(n.getDate()+1),{start:t,end:n}}function We(e){return e.toLocaleDateString(`en-AU`,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`})}function Ge(e){let{viewRoot:t,db:n,signal:r,ids:i,initialDate:a,unavailableHeaderText:s,onDateChange:c}=e,l={dateLeft:t.querySelector(`#${i.dateLeft}`),dateRight:t.querySelector(`#${i.dateRight}`),datePicker:t.querySelector(`#${i.datePicker}`),dateHeader:t.querySelector(`#${i.dateHeader}`),headerPax:t.querySelector(`#${i.headerPax}`),dateDropdown:t.querySelector(`#${i.dateDropdown}`),dateDropdownList:t.querySelector(`#${i.dateDropdownList}`),dateToday:t.querySelector(`#${i.dateToday}`)},u=O(a??ze()),f=new Set([Ie(D())]),p=null,m=!1;function h(){l.dateDropdown&&(l.dateDropdown.hidden=!0),l.datePicker?.setAttribute(`aria-expanded`,`false`)}function g(){l.dateToday&&(l.dateToday.disabled=Re(u,D()))}function ee(e,t){if(!l.dateHeader||!l.headerPax)return;l.dateHeader.textContent=We(e);let{dayTotal:n,lunch:r,dinner:i}=ue(t);l.headerPax.innerHTML=ke({dayTotal:n,lunch:r,dinner:i}),l.headerPax.hidden=!1}function _(e){if(!l.dateHeader||!l.headerPax)return;let{dayTotal:t,lunch:n,dinner:r}=ce();l.dateHeader.textContent=We(e),l.headerPax.innerHTML=ke({dayTotal:t,lunch:n,dinner:r}),l.headerPax.hidden=!1}function v(){m=!0,l.dateHeader&&(l.dateHeader.textContent=s??`Unavailable`),l.headerPax&&(l.headerPax.hidden=!0,l.headerPax.innerHTML=``)}function te(){m=!1}async function y(){p&&=(await p.close(),null)}async function b(){if(await y(),m)return;if(!o()){s?v():_(u);return}let e=u,{start:t,end:r}=Ue(e),i=d();p=n.query({sql:`SELECT * FROM bookings
                      WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
                      ORDER BY datetime`,parameters:[i,C(t),C(r)]}).watch(),p.registerListener({onData:t=>ee(e,t)})}function x(e,t){let n=new Map;for(let e of t)for(let t of Ne(e))n.set(A(t),ce());for(let t of e){let e=le(t.datetime),r=n.get(e);r&&de(r,t)}return n}async function ne(e){let{start:t,end:r}=Fe(e);return n.getAll(`SELECT * FROM bookings
             WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
             ORDER BY datetime`,[d(),C(t),C(r)])}function re(e,{dayTotal:t,lunch:n,dinner:r},{selectedKey:i,today:a}){let o=A(e),s=document.createElement(`button`);return s.type=`button`,s.className=`booking-date-option`,s.role=`option`,s.innerHTML=`
            <span class="booking-date-option-label">${Ve(e)}</span>
            <span class="booking-date-option-pax">${ke({dayTotal:t,lunch:n,dinner:r})}</span>
        `,o===i?(s.classList.add(`is-selected`),s.setAttribute(`aria-selected`,`true`)):s.setAttribute(`aria-selected`,`false`),Re(e,a)&&s.classList.add(`is-today`),s.addEventListener(`click`,t=>{t.stopPropagation(),S(e)}),s}function ie(e,t,{selectedKey:n,today:r}){let i=Ie(e),a=f.has(i),o=document.createElement(`div`);o.className=`booking-date-month-group`,a&&o.classList.add(`is-expanded`);let s=document.createElement(`button`);s.type=`button`,s.className=`booking-date-month-toggle`,s.dataset.monthKey=i,s.setAttribute(`aria-expanded`,String(a)),s.innerHTML=`
            <span class="booking-month-separator-label">${He(e)}</span>
            <span class="booking-date-month-chevron" aria-hidden="true"></span>
        `;let c=document.createElement(`div`);c.className=`booking-date-month-days`,c.hidden=!a;for(let i of Ne(e)){let e=A(i),{dayTotal:a,lunch:o,dinner:s}=t.get(e)??ce();c.appendChild(re(i,{dayTotal:a,lunch:o,dinner:s},{selectedKey:n,today:r}))}return s.addEventListener(`click`,e=>{e.stopPropagation();let t=s.getAttribute(`aria-expanded`)!==`true`;s.setAttribute(`aria-expanded`,String(t)),c.hidden=!t,o.classList.toggle(`is-expanded`,t),t?f.add(i):f.delete(i)}),o.append(s,c),o}async function ae(){if(!l.dateDropdownList)return;let e=D(),t=A(u),n=Pe(),r=new Map;r=o()?x(await ne(n),n):x([],n),l.dateDropdownList.innerHTML=``;for(let i of n)l.dateDropdownList.appendChild(ie(i,r,{selectedKey:t,today:e}))}async function oe(){f=new Set([Ie(D())]),await ae(),l.dateDropdown&&(l.dateDropdown.hidden=!1),l.datePicker?.setAttribute(`aria-expanded`,`true`),l.dateDropdownList?.querySelector(`.booking-date-option.is-selected`)?.scrollIntoView({block:`nearest`})}async function se(){l.dateDropdown&&(l.dateDropdown.hidden?await oe():h())}function S(e,{silent:t=!1}={}){u=O(e),Be(u),g(),h(),te(),b(),t||c?.(u)}function fe(){S(D())}return g(),_(u),b(),l.datePicker?.addEventListener(`click`,e=>{e.stopPropagation(),se()},{signal:r}),l.datePicker?.addEventListener(`keydown`,e=>{e.key===`Enter`||e.key===` `?(e.preventDefault(),se()):e.key===`Escape`&&h()},{signal:r}),l.dateDropdown?.addEventListener(`click`,e=>{e.stopPropagation()},{signal:r}),l.dateToday?.addEventListener(`click`,e=>{e.stopPropagation(),fe()},{signal:r}),document.addEventListener(`click`,()=>{h()},{signal:r}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&h()},{signal:r}),l.dateLeft?.addEventListener(`click`,()=>{S(je(u,-1))},{signal:r}),l.dateRight?.addEventListener(`click`,()=>{S(je(u,1))},{signal:r}),{getDate:()=>new Date(u),setDate:(e,t)=>S(e,t),refresh:()=>{te(),b()},setHeaderUnavailable:v,closeDropdown:h,destroy:async()=>{h(),await y()}}}var j=null,M=null,Ke=null,N=null,P=null,qe=null,Je={dateLeft:`booking-list-date-left`,dateRight:`booking-list-date-right`,datePicker:`booking-date-picker`,dateHeader:`booking-list-header`,headerPax:`booking-header-pax`,dateDropdown:`booking-date-dropdown`,dateDropdownList:`booking-date-dropdown-list`,dateToday:`booking-date-today`},Ye=()=>document.getElementById(`view-manager`);function Xe(e){let t=new Map;for(let n of e){let e=re(n.datetime),r=t.get(e)??S();se(r,n),t.set(e,r)}return t}function Ze(e,t,n,r){let i=`timeslot-group-${e}`,a=document.getElementById(i);if(!a){a=document.createElement(`section`),a.id=i,a.className=`booking-timeslot-group`;let e=document.createElement(`div`);e.className=`booking-timeslot-heading`,e.innerHTML=`
        <div class="booking-summary-primary">
            <span class="booking-timeslot-time">${ae(t)}</span>
            <span class="booking-summary-pax">${T(n)}</span>
        </div>`;let o=document.createElement(`div`);o.className=`booking-timeslot-items`,a.append(e,o),r.appendChild(a)}return a.querySelector(`.booking-timeslot-items`)}async function Qe(e,t){let n=oe(t);await te(P,e,d(),n)}function $e(e,t){let n=Ye();if(!n)return;let r=n.querySelector(`#booking-list`);if(e.length===0){r.innerHTML=`<p>No bookings for today. (or they are still downloading)</p>`;return}r.innerHTML=``;let i=Xe(e);e.forEach(e=>{let t=re(e.datetime),n=Ze(t,e.datetime,i.get(t),r),a=``;e.preference!==`none`&&(a=`<div class="booking-detail-preference">${e.preference.charAt(0).toUpperCase()+e.preference.slice(1)}</div>`);let o=b(e.status),s=x(e.status),c=`<button type="button" class="booking-detail-status ${o}" data-id="${e.id}">${s}</button>`,l=document.createElement(`div`);l.className=`booking-list-item-card`,l.innerHTML=`
            <div class="booking-summary-primary">
                <div class="booking-detail-time-preference">
                    <span class="booking-summary-name">${e.first_name} ${e.last_name}</span>
                    ${a}
                </div>
                <span class="booking-summary-time">${ae(e.datetime)}</span>
                <span class="booking-summary-pax">
                    ${T(e)}
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
        `,l.addEventListener(`click`,()=>{l.querySelector(`.booking-list-item-details`).classList.toggle(`is-expanded`)}),l.querySelector(`.booking-detail-status`).addEventListener(`click`,async t=>{t.stopPropagation(),await Qe(t.currentTarget.getAttribute(`data-id`),e.status)}),l.querySelector(`.booking-action-delete`).addEventListener(`click`,async t=>{t.stopPropagation(),confirm(`Are you sure you want to delete this booking?`)&&await y(P,e.id,d())}),l.querySelector(`.booking-action-edit`).addEventListener(`click`,e=>{e.stopPropagation();let t=e.target.getAttribute(`data-id`);qe?.(`create`,{edit:t})}),n.appendChild(l)});let{dayTotal:a,lunch:o,dinner:s}=ue(e),c=document.createElement(`section`);c.className=`booking-timeslot-group booking-day-total`,c.innerHTML=`
        <div class="booking-timeslot-heading">
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Lunch Total Pax</span>
                ${De(o)}
            </div>
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Dinner Total Pax</span>
                ${De(s)}
            </div>
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Total Pax</span>
                ${De(a)}
            </div>
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Total Bookings</span>
                ${e.length}
            </div>
        </div>
    `,r.appendChild(c)}function et(){let e=Ye();if(!e)return;let t=e.querySelector(`#booking-notice`),n=e.querySelector(`#booking-list`);t.hidden=!1,t.textContent=`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.`,n.innerHTML=``,N?.setHeaderUnavailable()}async function tt(){if(M&&=(await M.close(),null),!o()){et();return}let e=Ye();if(!e||!N)return;N.refresh();let t=e.querySelector(`#booking-notice`);t.hidden=!0;let n=N.getDate(),{start:r,end:i}=Ue(n),a=d();M=P.query({sql:`SELECT * FROM bookings
                  WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
                  ORDER BY datetime, last_name`,parameters:[a,C(r),C(i)]}).watch(),M.registerListener({onData:e=>$e(e,n)})}async function nt(e){P=e.db,qe=e.onNavigate,j=new AbortController;let{signal:t}=j,n=Ye();n&&(N=Ge({viewRoot:n,db:P,signal:t,ids:Je,unavailableHeaderText:`Bookings unavailable`,onDateChange:()=>{tt()}}),Ke=e.registerOnAccountSwitch(()=>{tt()}),await tt())}async function rt(){M&&=(await M.close(),null),await N?.destroy(),N=null,j?.abort(),j=null,Ke?.(),Ke=null,P=null,qe=null}async function it(e,t){return e.getAll(`SELECT id, name, pax_max FROM tables
         WHERE restaurant_id = ?
         ORDER BY name`,[t])}async function at(t){let{supabase:n}=await e(async()=>{let{supabase:e}=await import(`./supabaseClient-jAmk_zrl.js`);return{supabase:e}},__vite__mapDeps([0,1,2])),{data:r,error:i}=await n.from(`tables`).select(`id, name, pax_max`).eq(`restaurant_id`,t).order(`name`);if(i)throw i;return r??[]}function ot(e){return e.pax_max==null?e.name:`${e.name} (${e.pax_max} max)`}function st(e){return e<=0?`Delete this table?`:`This table is assigned to ${e} ${e===1?`booking`:`bookings`}. Deleting it will set those bookings to None. Continue?`}async function ct(t){if(!n())throw Error(`Adding tables requires an internet connection.`);let{supabase:r}=await e(async()=>{let{supabase:e}=await import(`./supabaseClient-jAmk_zrl.js`);return{supabase:e}},__vite__mapDeps([0,1,2])),{error:i}=await r.from(`tables`).insert({restaurant_id:t.restaurant_id,name:t.name,pax_max:t.pax_max});if(i)throw i}async function lt(t,r,i){if(!n())throw Error(`Updating tables requires an internet connection.`);let{supabase:a}=await e(async()=>{let{supabase:e}=await import(`./supabaseClient-jAmk_zrl.js`);return{supabase:e}},__vite__mapDeps([0,1,2])),{error:o}=await a.from(`tables`).update({name:r.name,pax_max:r.pax_max}).eq(`id`,t).eq(`restaurant_id`,i);if(o)throw o}async function ut(e,t,n){return(await e.get(`SELECT COUNT(*) AS count FROM bookings
         WHERE table_id = ? AND restaurant_id = ?`,[t,n]))?.count??0}async function dt(e,t,n){await e.execute(`UPDATE bookings SET table_id = NULL
         WHERE table_id = ? AND restaurant_id = ?`,[t,n])}async function ft(t,r,i){if(await dt(t,r,i),!n())throw Error(`Deleting tables requires an internet connection.`);let{supabase:a}=await e(async()=>{let{supabase:e}=await import(`./supabaseClient-jAmk_zrl.js`);return{supabase:e}},__vite__mapDeps([0,1,2])),{error:o}=await a.from(`tables`).delete().eq(`id`,r).eq(`restaurant_id`,i);if(o)throw o}function pt(e,t){let n=e.querySelector(`option[value=""]`);if(e.innerHTML=``,n)e.appendChild(n);else{let t=document.createElement(`option`);t.value=``,t.selected=!0,t.textContent=`None`,e.appendChild(t)}for(let n of t){let t=document.createElement(`option`);t.value=String(n.id),t.textContent=ot(n),e.appendChild(t)}}async function mt(e,t){let r=await it(e,t);return r.length>0||!n()?r:at(t)}var ht=null,gt=null,F=null,I=null,_t=null,vt={dateLeft:`create-booking-list-date-left`,dateRight:`create-booking-list-date-right`,datePicker:`create-booking-date-picker`,dateHeader:`create-booking-list-header`,headerPax:`create-booking-header-pax`,dateDropdown:`create-booking-date-dropdown`,dateDropdownList:`create-booking-date-dropdown-list`,dateToday:`create-booking-date-today`},L=()=>document.getElementById(`view-create`);function yt(){let e=L();if(!e)return;let t=e.querySelector(`#bookingForm`);t.reset();let n=e.querySelector(`#pageTitle`),r=e.querySelector(`#create-booking-notice`),i=e.querySelector(`#timeslot`),a=e.querySelector(`#bookingDate`);n.textContent=`New Booking`,r.hidden=!0,r.textContent=``,ee(i),a.value=A(F?.getDate()??new Date);let o=e.querySelector(`#tableId`);o&&(o.value=``),t.querySelectorAll(`input, select, textarea, button`).forEach(e=>{e.disabled=!1})}function bt(){let e=L();if(!e)return!1;let t=e.querySelector(`#bookingForm`),n=e.querySelector(`#create-booking-notice`);return o()?(n.hidden=!0,t.querySelectorAll(`input, select, textarea, button`).forEach(e=>{e.disabled=!1}),!0):(n.hidden=!1,n.textContent=`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant before creating bookings.`,t.querySelectorAll(`input, select, textarea, button`).forEach(e=>{e.disabled=!0}),!1)}async function xt(){let e=L();if(!e||!I)return;let t=e.querySelector(`#tableId`);if(!t)return;if(!o()){pt(t,[]);return}let n=d();pt(t,await mt(I,n))}async function St(e,t){let n=L();if(!n)return;let r=n.querySelector(`#pageTitle`),i=n.querySelector(`#bookingDate`),a=n.querySelector(`#timeslot`),o=n.querySelector(`#firstName`),s=n.querySelector(`#lastName`),c=n.querySelector(`#phoneNumber`),l=n.querySelector(`#email`),u=n.querySelector(`#totalPax`),f=n.querySelector(`#adultPax`),p=n.querySelector(`#childPax`),m=n.querySelector(`#hcPax`),h=n.querySelector(`#preference`),g=n.querySelector(`#tableId`),ee=n.querySelector(`#additionalDetails`);r.textContent=`Loading booking…`;let _=d(),v=await fe(I,e,_);if(!v){_t?.(`manager`,{replace:!0});return}t.editingId=e,t.editingStatus=v.status,r.textContent=`Edit Booking`,i.value=le(v.datetime),F?.setDate(Le(i.value)??new Date,{silent:!0}),a.value=re(v.datetime),o.value=v.first_name,s.value=v.last_name,c.value=v.phone_number??``,l.value=v.email??``,u.value=v.total_pax,f.value=v.adult_pax,p.value=v.child_pax,m.value=v.hc_pax,h.value=v.preference??`none`,g&&(g.value=v.table_id==null?``:String(v.table_id)),ee.value=v.notes??``}function Ct(e){let t=e.querySelector(`#totalPax`),n=e.querySelector(`#childPax`),r=e.querySelector(`#hcPax`),i=e.querySelector(`#adultPax`),a=parseInt(t.value,10)||0,o=parseInt(n.value,10)||0,s=parseInt(r.value,10)||0,c=a-o-s;c<0&&(c=0),i.value=c}async function wt(e){I=e.db,_t=e.onNavigate,ht=new AbortController;let{signal:n}=ht,r=L();if(!r)return;let i=r.querySelector(`#bookingForm`);r.querySelector(`#timeslot`);let a=r.querySelector(`#totalPax`),s=r.querySelector(`#childPax`),c=r.querySelector(`#hcPax`),l=r.querySelector(`#bookingDate`),u={editingId:null,editingStatus:t.PENDING},f=!1;F=Ge({viewRoot:r,db:I,signal:n,ids:vt,onDateChange:e=>{f||=(f=!0,l.value=A(e),!1)}}),yt(),l.addEventListener(`change`,()=>{if(f)return;let e=Le(l.value);e&&(f=!0,F?.setDate(e,{silent:!0}),f=!1)},{signal:n});let m=()=>Ct(r);a.addEventListener(`change`,m,{signal:n}),s.addEventListener(`change`,m,{signal:n}),c.addEventListener(`change`,m,{signal:n}),gt=e.registerOnAccountSwitch(()=>{bt(),F?.refresh(),xt()}),window.addEventListener(`online`,()=>{o()&&xt()},{signal:n}),bt()&&(await xt(),e.editId&&await St(e.editId,u)),i.addEventListener(`submit`,async e=>{if(e.preventDefault(),!o())return;let n=r.querySelector(`#bookingDate`),i=r.querySelector(`#timeslot`),a=r.querySelector(`#firstName`),s=r.querySelector(`#lastName`),c=r.querySelector(`#phoneNumber`),l=r.querySelector(`#email`),f=r.querySelector(`#totalPax`),m=r.querySelector(`#adultPax`),h=r.querySelector(`#childPax`),g=r.querySelector(`#hcPax`),ee=r.querySelector(`#preference`),te=r.querySelector(`#tableId`),y=r.querySelector(`#additionalDetails`),b=te?.value??``,x=b===``?null:parseInt(b,10),ne={first_name:a.value,last_name:s.value,phone_number:c.value,email:l.value,total_pax:parseInt(f.value,10),adult_pax:parseInt(m.value,10),child_pax:parseInt(h.value,10),hc_pax:parseInt(g.value,10),preference:ee.value,notes:y.value,datetime:v(n.value,i.value),status:u.editingId?u.editingStatus:t.PENDING,table_id:x};u.editingId?await pe(I,u.editingId,ne,d()):await _(I,{...ne,profile_id:p(),restaurant_id:d(),id:crypto.randomUUID(),created_at:C(new Date)}),_t?.(`manager`)},{signal:n})}async function Tt(){await F?.destroy(),F=null,ht?.abort(),ht=null,gt?.(),gt=null,I=null,_t=null}var Et=null;async function Dt(e){Et=new AbortController}async function Ot(){Et?.abort(),Et=null}var kt=null,R=null,At=null,jt=null,z=0,B=()=>document.getElementById(`view-metrics`);function Mt(e,t){let n=new Date(t);return n.setDate(n.getDate()-1),`${e.toLocaleDateString(`en-AU`,{weekday:`short`,day:`numeric`,month:`short`})} - ${n.toLocaleDateString(`en-AU`,{weekday:`short`,day:`numeric`,month:`short`,year:`numeric`})}`}function Nt(e,t){return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}function Pt(e,t,n){let r=B()?.querySelector(`#metrics-header`),i=B()?.querySelector(`#metrics-table`);if(!r||!i)return;r.textContent=Mt(t,n);let{days:a,lunchTotal:o,dinnerTotal:s,weekendTotal:c,weekTotal:l}=ie(e,t),u=new Date;u.setHours(0,0,0,0),i.innerHTML=`
        <table class="metrics-table">
            <thead>
                <tr>
                    <th scope="col">Day</th>
                    <th scope="col">Lunch</th>
                    <th scope="col">Dinner</th>
                    <th scope="col">Day total</th>
                </tr>
            </thead>
            <tbody>
                ${a.map(e=>`
            <tr class="${Nt(e.date,u)?`metrics-row--today`:``}">
                <th scope="row">${e.date.toLocaleDateString(`en-AU`,{weekday:`long`,day:`numeric`,month:`short`})}</th>
                <td>${E(e.lunch)}</td>
                <td>${E(e.dinner)}</td>
                <td>${E(e.dayTotal)}</td>
            </tr>
        `).join(``)}
            </tbody>
            <tfoot>
                <tr class="metrics-row--summary">
                    <th scope="row">Week total</th>
                    <td>${E(o)}</td>
                    <td>${E(s)}</td>
                    <td>${E(l)}</td>
                </tr>
            </tfoot>
        </table>
        <table class="metrics-table metrics-table--summary">
            <thead>
                <tr>
                    <th scope="col">Period</th>
                    <th scope="col">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr class="metrics-row--summary">
                    <th scope="row">Weekend total</th>
                    <td>${E(c)}</td>
                </tr>
                <tr class="metrics-row--summary">
                    <th scope="row">Week total</th>
                    <td>${E(l)}</td>
                </tr>
            </tbody>
        </table>
    `}function Ft(){let e=B()?.querySelector(`#metrics-notice`),t=B()?.querySelector(`#metrics-table`),n=B()?.querySelector(`#metrics-header`);!e||!t||!n||(e.hidden=!1,e.textContent=`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.`,t.innerHTML=``,n.textContent=`Metrics unavailable`)}async function It(){if(!jt)return;R&&=(await R.close(),null);let e=B()?.querySelector(`#metrics-notice`);if(!o()){Ft();return}e&&(e.hidden=!0);let{start:t,end:n}=ne(new Date,z),r=d();R=jt.query({sql:`SELECT * FROM bookings
                  WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
                  ORDER BY datetime`,parameters:[r,C(t),C(n)]}).watch(),R.registerListener({onData:e=>Pt(e,t,n)})}async function Lt(e){jt=e.db,kt=new AbortController;let{signal:t}=kt;z=0,B()?.querySelector(`#metrics-week-left`)?.addEventListener(`click`,()=>{--z,It()},{signal:t}),B()?.querySelector(`#metrics-week-right`)?.addEventListener(`click`,()=>{z+=1,It()},{signal:t}),At=e.registerOnAccountSwitch(()=>{It()}),await It()}async function Rt(){At?.(),At=null,R&&=(await R.close(),null),kt?.abort(),kt=null,jt=null,z=0}var zt=null,V=null,Bt=null,H=null,U=null,W=[],G=0,Vt=`Table changes require an internet connection. You can still view synced tables and assign them to bookings offline.`,Ht=`No tables synced yet. Connect online once to download tables for offline use.`,K=()=>document.getElementById(`view-tables`);function Ut(e){K()?.querySelector(`#table-form`)?.querySelectorAll(`input, button`).forEach(t=>{t.disabled=e})}function Wt(){U=null;let e=K()?.querySelector(`#table-form`),t=K()?.querySelector(`#table-form-heading`),n=K()?.querySelector(`#table-save-btn`),r=K()?.querySelector(`#table-cancel-btn`);e?.reset(),t&&(t.textContent=`Add Table`),n&&(n.textContent=`Save Table`),r&&(r.hidden=!0)}function q(e){let t=K()?.querySelector(`#tables-notice`);t&&(t.hidden=!1,t.textContent=e)}function Gt(){let e=K()?.querySelector(`#tables-notice`);e&&(e.hidden=!0,e.textContent=``)}function Kt(){q(`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.`);let e=K()?.querySelector(`#tables-list`);e&&(e.innerHTML=``),W=[],Ut(!0)}function J(){if(!o())return;let e=!n();if(Ut(e),e){q(Vt);return}Gt()}function qt(e){let t=e.trim();if(t===``)return null;let n=parseInt(t,10);return Number.isNaN(n)?null:n}async function Jt(){if(!H||!o()||!n())return;let e=++G,t=d();try{let n=await at(t);if(e!==G)return;Y(n)}catch{e===G&&Y(W)}}async function Yt(e){if(!o()){Y(e);return}if(n()){await Jt();return}Y(e)}function Xt(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function Y(e){let t=K()?.querySelector(`#tables-list`);if(!t)return;W=e;let r=!n();if(e.length===0){t.innerHTML=`<p class="tables-empty">No tables configured yet.</p>`,n()?o()&&Gt():q(Ht);return}n()&&o()&&Gt(),t.innerHTML=`
        <table class="tables-list">
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Max Pax</th>
                    <th scope="col">Actions</th>
                </tr>
            </thead>
            <tbody>${e.map(e=>{let t=e.pax_max==null?`—`:String(e.pax_max),n=r?` disabled`:``;return`
            <tr data-id="${e.id}">
                <td>${Xt(ot(e))}</td>
                <td>${Xt(t)}</td>
                <td class="tables-actions">
                    <button type="button" class="tables-edit-btn" data-id="${e.id}"${n}>Edit</button>
                    <button type="button" class="tables-delete-btn" data-id="${e.id}"${n}>Delete</button>
                </td>
            </tr>
        `}).join(``)}</tbody>
        </table>
    `,r&&o()&&q(Vt)}function Zt(e){U=e.id;let t=K()?.querySelector(`#table-name`),n=K()?.querySelector(`#table-pax-max`),r=K()?.querySelector(`#table-form-heading`),i=K()?.querySelector(`#table-save-btn`),a=K()?.querySelector(`#table-cancel-btn`);t&&(t.value=e.name),n&&(n.value=e.pax_max==null?``:String(e.pax_max)),r&&(r.textContent=`Edit Table`),i&&(i.textContent=`Update Table`),a&&(a.hidden=!1),t?.focus()}async function Qt(){if(!H)return;if(V&&=(await V.close(),null),Wt(),!o()){Kt();return}J();let e=d();V=H.query({sql:`SELECT id, name, pax_max FROM tables
                  WHERE restaurant_id = ?
                  ORDER BY name`,parameters:[e]}).watch(),V.registerListener({onData:e=>{Yt(e)}})}async function $t(e){H=e.db,zt=new AbortController;let{signal:t}=zt;W=[],G=0,K()?.querySelector(`#tables-list`)?.addEventListener(`click`,async e=>{let t=e.target;if(!(t instanceof HTMLElement)||!H||!o()||!n())return;let r=d(),i=t.closest(`.tables-edit-btn`),a=t.closest(`.tables-delete-btn`);if(i){let e=parseInt(i.getAttribute(`data-id`)??``,10),t=W.find(t=>t.id===e);t&&Zt(t);return}if(a){let e=parseInt(a.getAttribute(`data-id`)??``,10);if(Number.isNaN(e))return;try{let t=st(await ut(H,e,r));if(!window.confirm(t))return;await ft(H,e,r),U===e&&Wt(),await Jt()}catch(e){q(e.message??`Could not delete table.`)}}},{signal:t}),K()?.querySelector(`#table-cancel-btn`)?.addEventListener(`click`,()=>{Wt(),J()},{signal:t}),K()?.querySelector(`#table-form`)?.addEventListener(`submit`,async e=>{if(e.preventDefault(),!H||!o())return;if(!n()){q(Vt);return}let t=d(),r=K()?.querySelector(`#table-name`),i=K()?.querySelector(`#table-pax-max`),a=r?.value.trim()??``,s=qt(i?.value??``);if(!a){q(`Table name is required.`);return}try{U==null?(await ct({restaurant_id:t,name:a,pax_max:s}),K()?.querySelector(`#table-form`)?.reset(),await Jt()):(await lt(U,{name:a,pax_max:s},t),Wt(),await Jt()),Gt(),J()}catch(e){q(e.message??`Could not save table.`)}},{signal:t}),window.addEventListener(`online`,()=>{J(),W.length>0&&Y(W)},{signal:t}),window.addEventListener(`offline`,()=>{J(),W.length>0&&Y(W)},{signal:t}),Bt=e.registerOnAccountSwitch(()=>{Qt()}),await Qt()}async function en(){Bt?.(),Bt=null,V&&=(await V.close(),null),zt?.abort(),zt=null,H=null,U=null,W=[],G=0}var tn=null,nn=null,X=null,Z=()=>document.getElementById(`view-sync-status`);function Q(e){return e?new Date(e).toLocaleString():`—`}function rn(e){return e==null?``:e<1024?`${e} B`:`${(e/1024).toFixed(1)} kB`}function an(e){return e===`offline`?`Offline`:e===`warning`?`Attention needed`:`Up to date`}function $(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function on(e){let t=Z()?.querySelector(`#sync-status-summary`);if(!t)return;let n=e.online?e.connected?`Connected`:e.connecting?`Connecting…`:`Disconnected`:`Offline`;t.innerHTML=`
        <div class="sync-status-metric sync-status-metric--${e.health}">
            <span class="sync-status-metric-label">Status</span>
            <span class="sync-status-metric-value">${an(e.health)}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Connection</span>
            <span class="sync-status-metric-value">${n}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Last synced</span>
            <span class="sync-status-metric-value">${Q(e.lastSyncedAt)}</span>
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
    `,e.statusMessage&&t.insertAdjacentHTML(`beforeend`,`<p class="sync-status-message">${$(e.statusMessage)}</p>`)}function sn(e){let t=[e.opData?.first_name,e.opData?.last_name].filter(Boolean).join(` `),n=e.opData?.datetime??``,r=e.opData?.status??``;return`
        <article class="sync-status-item">
            <div class="sync-status-item-header">
                <span class="sync-status-op-badge sync-status-op-badge--${e.op.toLowerCase()}">${e.op}</span>
                <span class="sync-status-item-id">${$(e.id)}</span>
            </div>
            ${t?`<p class="sync-status-item-detail">${$(t)}</p>`:``}
            ${n?`<p class="sync-status-item-detail">${$(n)}</p>`:``}
            ${r?`<p class="sync-status-item-detail">Status: ${$(r)}</p>`:``}
            <p class="sync-status-item-meta">Table: ${$(e.table)}</p>
        </article>
    `}function cn(e){let t=Z()?.querySelector(`#sync-status-uploads-list`);if(t){if(e.pendingUploads.length===0){t.innerHTML=`<p class="sync-status-empty">No pending uploads${e.uploadQueueSize==null?``:` (${rn(e.uploadQueueSize)})`}</p>`;return}t.innerHTML=(e.uploadQueueSize==null?``:`<p class="sync-status-queue-size">Queue size: ${rn(e.uploadQueueSize)}</p>`)+e.pendingUploads.map(sn).join(``)}}function ln(e){let t=Z()?.querySelector(`#sync-status-downloads-list`);if(!t)return;let n=[],r=e.dataFlowStatus??{};if(r.downloading&&e.downloadProgress){let t=Math.round(e.downloadProgress.downloadedFraction*100);n.push(`
            <div class="sync-status-download-progress">
                <p>Downloading… ${e.downloadProgress.downloadedOperations} / ${e.downloadProgress.totalOperations} operations</p>
                <div class="sync-status-progress-bar" role="progressbar" aria-valuenow="${t}" aria-valuemin="0" aria-valuemax="100">
                    <div class="sync-status-progress-bar-fill" style="width: ${t}%"></div>
                </div>
            </div>
        `)}if(e.syncStreams?.length)for(let t of e.syncStreams){let e=t.progress,r=t.subscription?.name??`Sync stream`;if(e){let t=Math.round(e.downloadedFraction*100);n.push(`
                    <article class="sync-status-item">
                        <p class="sync-status-item-detail">${$(r)}</p>
                        <p class="sync-status-item-meta">${e.downloadedOperations} / ${e.totalOperations} (${t}%)</p>
                    </article>
                `)}else n.push(`
                    <article class="sync-status-item">
                        <p class="sync-status-item-detail">${$(r)}</p>
                        <p class="sync-status-item-meta">Idle</p>
                    </article>
                `)}r.downloading||n.push(`
            <article class="sync-status-item sync-status-item--summary">
                <p class="sync-status-item-detail">${e.hasSynced?`Up to date`:`Waiting for first sync`}</p>
                <p class="sync-status-item-meta">Last synced: ${Q(e.lastSyncedAt)}</p>
                ${e.bookingCount==null?``:`<p class="sync-status-item-meta">${e.bookingCount} booking(s) stored locally</p>`}
            </article>
        `);let i=a();if(i.length>0){n.push(`<h3 class="sync-status-activity-heading">Recent download activity</h3>`);for(let e of i)n.push(`
                <article class="sync-status-item">
                    <p class="sync-status-item-detail">${Q(e.at)}</p>
                    <p class="sync-status-item-meta">${e.operations==null?`Download completed`:`${e.operations} operations received`}</p>
                </article>
            `)}r.uploading&&n.unshift(`<p class="sync-status-active-label">Uploading changes…</p>`),t.innerHTML=n.length?n.join(``):`<p class="sync-status-empty">No download activity</p>`}function un(e){let t=Z()?.querySelector(`#sync-status-issues-list`);if(!t)return;let n=[],r=e.dataFlowStatus??{};r.downloadError&&n.push(`
            <article class="sync-status-issue sync-status-issue--error">
                <p class="sync-status-issue-type">Download error</p>
                <p class="sync-status-issue-message">${$(r.downloadError.message??String(r.downloadError))}</p>
            </article>
        `),r.uploadError&&n.push(`
            <article class="sync-status-issue sync-status-issue--error">
                <p class="sync-status-issue-type">Upload error</p>
                <p class="sync-status-issue-message">${$(r.uploadError.message??String(r.uploadError))}</p>
            </article>
        `),e.syncConfigured&&!e.hasRestaurant&&n.push(`
            <article class="sync-status-issue sync-status-issue--warning">
                <p class="sync-status-issue-type">Restaurant not assigned</p>
                <p class="sync-status-issue-message">Your account has no restaurant_id. Sync cannot start until an admin assigns one.</p>
            </article>
        `),e.syncConfigured||n.push(`
            <article class="sync-status-issue sync-status-issue--warning">
                <p class="sync-status-issue-type">Local-only mode</p>
                <p class="sync-status-issue-message">VITE_POWERSYNC_URL is not configured. Data stays in the browser only.</p>
            </article>
        `),e.uploadQueueCount>0&&e.online&&n.push(`
            <article class="sync-status-issue sync-status-issue--warning">
                <p class="sync-status-issue-type">Pending uploads</p>
                <p class="sync-status-issue-message">${e.uploadQueueCount} change(s) waiting to upload.</p>
            </article>
        `);let a=i();for(let e of a)n.push(`
            <article class="sync-status-issue sync-status-issue--${e.type.includes(`discarded`)?`error`:`warning`}">
                <p class="sync-status-issue-type">${$(e.type.replace(/_/g,` `))}</p>
                <p class="sync-status-issue-message">${$(e.message)}</p>
                <p class="sync-status-issue-meta">${Q(e.at)}</p>
            </article>
        `);t.innerHTML=n.length?n.join(``):`<p class="sync-status-empty">No issues detected</p>`}function dn(e){on(e),cn(e),ln(e),un(e)}function fn(e,t){!e||!X||(e.disabled=!1,navigator.onLine?t&&X.connected?e.textContent=`Reconnect`:e.textContent=`Failed to connect`:e.textContent=`Offline`)}async function pn(e){X=e.db,tn=new AbortController;let{signal:t}=tn,n=Z()?.querySelector(`#sync-status-reconnect-btn`);n?.addEventListener(`click`,async()=>{if(!n||!X)return;n.disabled=!0,n.textContent=`Reconnecting...`;let e=null;try{e=await m(X)}finally{fn(n,e)}},{signal:t}),window.addEventListener(`online`,()=>{n?.textContent===`Offline`&&(n.textContent=`Reconnect`)},{signal:t}),nn=r(dn)}async function mn(){nn?.(),nn=null,tn?.abort(),tn=null,X=null}var{name:hn}=w(),gn=null,_n=Ee({...await Se({initialRoute:hn,onNavigate:(e,t)=>gn?.(e,t)}),views:{manager:{mount:nt,unmount:rt},create:{mount:wt,unmount:Tt},walkin:{mount:Dt,unmount:Ot},metrics:{mount:Lt,unmount:Rt},tables:{mount:$t,unmount:en},"sync-status":{mount:pn,unmount:mn}}});gn=_n.navigate,await _n.start();