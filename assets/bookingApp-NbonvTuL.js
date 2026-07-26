const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/supabaseClient-CtHlCuI7.js","assets/supabaseClient-BEL8yLtP.js","assets/preload-helper-DVdjxgLz.js"])))=>i.map(i=>d[i]);
import"./style-CEPcSWMK.js";import{t as e}from"./preload-helper-DVdjxgLz.js";import"./register-DSngRNPz.js";import{g as t,h as n,i as r,n as i,t as a,u as o,y as s}from"./syncStatus-BBCGoWc1.js";import{i as c,n as l,t as u}from"./footer-BVkL_Kwv.js";import{n as d,r as f,t as p}from"./accountSwitcher-28aTGeGE.js";import{i as m}from"./sync-D1NSZ5_i.js";import{n as h,t as g}from"./db-BOyuMU2j.js";import{S as _,_ as v,a as ee,b as y,c as b,d as x,f as S,g as te,h as ne,i as re,l as ie,m as ae,n as oe,o as se,p as ce,r as le,s as C,t as ue,u as de,v as w,y as fe}from"./bookings-CKoOBd8Y.js";var pe=[{name:`manager`,label:`BOOKINGS`,className:`booking-sidebar-nav-link--bookings`},{name:`create`,label:`NEW BOOKING`,className:`booking-sidebar-nav-link--new-booking`},{name:`walkin`,label:`WALK-IN`,className:`booking-sidebar-nav-link--walk-in`}];function me(e,{activeRoute:t,onNavigate:n,showSaveButton:r=!1}={}){if(!e)return;let i=r?`<button type="submit" form="bookingForm" class="booking-sidebar-nav-link booking-sidebar-nav-link--save">SAVE BOOKING</button>`:``;e.innerHTML=pe.map(({name:e,label:n,className:r})=>{let i=t===e;return`<button type="button" class="booking-sidebar-nav-link ${r}${i?` is-active`:``}" data-route="${e}"${i?` aria-current="page"`:``}>${n}</button>`}).join(``)+i,e.querySelectorAll(`[data-route]`).forEach(e=>{e.addEventListener(`click`,()=>{let r=e.getAttribute(`data-route`);r&&r!==t&&n?.(r)})})}function he(e,t={}){let n=document.createElement(`nav`);n.className=`booking-sidebar-nav`,e.replaceWith(n),me(n,t)}function ge(e={}){me(document.querySelector(`.booking-sidebar-nav`),e)}var _e=new Set,ve=new Set([`manager`,`create`,`walkin`]);function ye(e){for(let t of _e)t(e)}function be(e){let t=document.getElementById(`booking-shell-layout`),n=document.getElementById(`booking-sidebar-panel`),r=ve.has(e);t?.classList.toggle(`booking-page-layout--no-sidebar`,!r),n&&(n.hidden=!r)}async function xe({initialRoute:e,onNavigate:t}){l(document.getElementById(`site-navbar-mount`),{basePath:`../`,activeRoute:e,onNavigate:t}),u(document.getElementById(`site-footer-mount`),{basePath:`../`}),he(document.getElementById(`booking-sidebar-mount`),{activeRoute:e,onNavigate:t,showSaveButton:e===`create`}),be(e);let n=f({requireAuth:!0,loginRedirect:`../login.html`,onSwitch:e=>ye(e)}),r=await h();return await n,g(r),{db:r,registerOnAccountSwitch(e){return _e.add(e),()=>_e.delete(e)},setActiveRoute(e){be(e),c({activeRoute:e,onNavigate:t,basePath:`../`}),ve.has(e)&&ge({activeRoute:e,onNavigate:t,showSaveButton:e===`create`})}}}var Se={manager:`manager`,create:`create`,walkin:`walkin`,metrics:`metrics`,tables:`tables`,"sync-status":`sync-status`},Ce=/\/booking\/(manager|create|walkin|metrics|tables|sync-status)\/?$/;function T(e=window.location){let t=e.pathname.replace(/\/$/,``),n=new URLSearchParams(e.search).get(`edit`),r=t.match(Ce)?.[1]??`manager`;return{name:r,editId:r===`create`?n:null}}function we(e,{edit:t}={}){let n=Se[e]??Se.manager,r=new URL(`/booking-system/booking/${n}`,window.location.origin);return t?r.searchParams.set(`edit`,t):r.searchParams.delete(`edit`),`${r.pathname}${r.search}`}function Te(e){let{db:t,registerOnAccountSwitch:n,setActiveRoute:r,views:i}=e,a=null,o={},s=!1,c={manager:document.getElementById(`view-manager`),create:document.getElementById(`view-create`),walkin:document.getElementById(`view-walkin`),metrics:document.getElementById(`view-metrics`),tables:document.getElementById(`view-tables`),"sync-status":document.getElementById(`view-sync-status`)};function l(e){for(let[t,n]of Object.entries(c))n&&(n.hidden=t!==e)}async function u(e,a={}){let o=i[e];if(!o)throw Error(`Unknown route: ${e}`);l(e),r(e),await o.mount({db:t,registerOnAccountSwitch:n,onNavigate:f,...a})}async function d(){if(!a)return;let e=i[a];e?.unmount&&await e.unmount()}async function f(e,{edit:t,replace:n=!1}={}){if(!s&&!(a===e&&(e!==`create`||(t??null)===o.editId))){s=!0;try{let r=we(e,{edit:t});n?history.replaceState({route:e,editId:t??null},``,r):history.pushState({route:e,editId:t??null},``,r),await d(),a=e,o={editId:t??null},await u(e,{editId:t??null})}finally{s=!1}}}async function p(){let{name:e,editId:t}=T();a=e,o={editId:t},l(e),r(e),await u(e,{editId:t}),window.addEventListener(`popstate`,async e=>{if(!s){s=!0;try{let t=e.state,n=t?.route??T().name,i=t?.editId??T().editId;await d(),a=n,o={editId:i},l(n),r(n),await u(n,{editId:i})}finally{s=!1}}})}return{start:p,navigate:f}}function E(e){let{total_pax:t,adult_pax:n,child_pax:r,hc_pax:i}=e;return`
        <span class="booking-summary-pax-total">${t}</span>
        <span class="booking-summary-pax-breakdown">
            <span>${n}A</span>
            <span>${r}C</span>
            <span>${i}HC</span>
        </span>
    `}function Ee(e){return`<span class="booking-summary-pax">${E(e)}</span>`}function D(e){return`<div class="metrics-pax-cell">${E(e)}</div>`}function De({dayTotal:e,lunch:t,dinner:n}){return`
        <span class="booking-summary-pax-total">${e.booking_count}-${e.total_pax}</span>
        <span class="booking-summary-pax-breakdown">
            <span>L${t.booking_count}-${t.total_pax}</span>
            <span>D${n.booking_count}-${n.total_pax}</span>
        </span>
    `}function Oe(e){return`<span class="booking-summary-pax">${De(e)}</span>`}var ke=12;function O(){let e=new Date;return e.setHours(0,0,0,0),e}function k(e){let t=new Date(e);return t.setHours(0,0,0,0),t}function Ae(e,t){let n=new Date(e);return n.setDate(n.getDate()+t),n}function A(e){let t=k(e);return t.setDate(1),t}function je(e,t){let n=A(e);return n.setMonth(n.getMonth()+t),n}function Me(e){let t=A(e),n=[],r=new Date(t);for(;r.getMonth()===t.getMonth();)n.push(new Date(r)),r.setDate(r.getDate()+1);return n}function Ne(){let e=O(),t=[];for(let n=-1;n<=ke;n+=1)t.push(je(e,n));return t}function Pe(e){return{start:A(e[0]),end:je(A(e[e.length-1]),1)}}function j(e){let t=k(e);return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,`0`)}-${String(t.getDate()).padStart(2,`0`)}`}function Fe(e){let t=k(e);return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,`0`)}`}function Ie(e){if(!/^\d{4}-\d{2}-\d{2}$/.test(e))return null;let t=new Date(`${e}T00:00:00`);return Number.isNaN(t.getTime())?null:t}function Le(e,t){return j(e)===j(t)}function Re(){return Ie(localStorage.getItem(s.MANAGER_SELECTED_DATE))??O()}function ze(e){localStorage.setItem(s.MANAGER_SELECTED_DATE,j(e))}function Be(e){return e.toLocaleDateString(`en-AU`,{weekday:`short`,day:`numeric`})}function Ve(e){return e.toLocaleDateString(`en-AU`,{month:`short`,year:`numeric`})}function He(e){let t=new Date(e);t.setHours(0,0,0,0);let n=new Date(t);return n.setDate(n.getDate()+1),{start:t,end:n}}function Ue(e){return e.toLocaleDateString(`en-AU`,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`})}function We(e){let{viewRoot:t,db:n,signal:r,ids:i,initialDate:a,unavailableHeaderText:s,onDateChange:c}=e,l={dateLeft:t.querySelector(`#${i.dateLeft}`),dateRight:t.querySelector(`#${i.dateRight}`),datePicker:t.querySelector(`#${i.datePicker}`),dateHeader:t.querySelector(`#${i.dateHeader}`),headerPax:t.querySelector(`#${i.headerPax}`),dateDropdown:t.querySelector(`#${i.dateDropdown}`),dateDropdownList:t.querySelector(`#${i.dateDropdownList}`),dateToday:t.querySelector(`#${i.dateToday}`)},u=k(a??Re()),f=new Set([Fe(O())]),p=null,m=!1;function h(){l.dateDropdown&&(l.dateDropdown.hidden=!0),l.datePicker?.setAttribute(`aria-expanded`,`false`)}function g(){l.dateToday&&(l.dateToday.disabled=Le(u,O()))}function _(e,t){if(!l.dateHeader||!l.headerPax)return;l.dateHeader.textContent=Ue(e);let{dayTotal:n,lunch:r,dinner:i}=le(t);l.headerPax.innerHTML=Oe({dayTotal:n,lunch:r,dinner:i}),l.headerPax.hidden=!1}function v(e){if(!l.dateHeader||!l.headerPax)return;let{dayTotal:t,lunch:n,dinner:r}=se();l.dateHeader.textContent=Ue(e),l.headerPax.innerHTML=Oe({dayTotal:t,lunch:n,dinner:r}),l.headerPax.hidden=!1}function ee(){m=!0,l.dateHeader&&(l.dateHeader.textContent=s??`Unavailable`),l.headerPax&&(l.headerPax.hidden=!0,l.headerPax.innerHTML=``)}function y(){m=!1}async function b(){p&&=(await p.close(),null)}async function x(){if(await b(),m)return;if(!o()){s?ee():v(u);return}let e=u,{start:t,end:r}=He(e),i=d();p=n.query({sql:`SELECT * FROM bookings
                      WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
                      ORDER BY datetime`,parameters:[i,w(t),w(r)]}).watch(),p.registerListener({onData:t=>_(e,t)})}function S(e,t){let n=new Map;for(let e of t)for(let t of Me(e))n.set(j(t),se());for(let t of e){let e=ce(t.datetime),r=n.get(e);r&&ue(r,t)}return n}async function te(e){let{start:t,end:r}=Pe(e);return n.getAll(`SELECT * FROM bookings
             WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
             ORDER BY datetime`,[d(),w(t),w(r)])}function ne(e,{dayTotal:t,lunch:n,dinner:r},{selectedKey:i,today:a}){let o=j(e),s=document.createElement(`button`);return s.type=`button`,s.className=`booking-date-option`,s.role=`option`,s.innerHTML=`
            <span class="booking-date-option-label">${Be(e)}</span>
            <span class="booking-date-option-pax">${Oe({dayTotal:t,lunch:n,dinner:r})}</span>
        `,o===i?(s.classList.add(`is-selected`),s.setAttribute(`aria-selected`,`true`)):s.setAttribute(`aria-selected`,`false`),Le(e,a)&&s.classList.add(`is-today`),s.addEventListener(`click`,t=>{t.stopPropagation(),C(e)}),s}function re(e,t,{selectedKey:n,today:r}){let i=Fe(e),a=f.has(i),o=document.createElement(`div`);o.className=`booking-date-month-group`,a&&o.classList.add(`is-expanded`);let s=document.createElement(`button`);s.type=`button`,s.className=`booking-date-month-toggle`,s.dataset.monthKey=i,s.setAttribute(`aria-expanded`,String(a)),s.innerHTML=`
            <span class="booking-month-separator-label">${Ve(e)}</span>
            <span class="booking-date-month-chevron" aria-hidden="true"></span>
        `;let c=document.createElement(`div`);c.className=`booking-date-month-days`,c.hidden=!a;for(let i of Me(e)){let e=j(i),{dayTotal:a,lunch:o,dinner:s}=t.get(e)??se();c.appendChild(ne(i,{dayTotal:a,lunch:o,dinner:s},{selectedKey:n,today:r}))}return s.addEventListener(`click`,e=>{e.stopPropagation();let t=s.getAttribute(`aria-expanded`)!==`true`;s.setAttribute(`aria-expanded`,String(t)),c.hidden=!t,o.classList.toggle(`is-expanded`,t),t?f.add(i):f.delete(i)}),o.append(s,c),o}async function ie(){if(!l.dateDropdownList)return;let e=O(),t=j(u),n=Ne(),r=new Map;r=o()?S(await te(n),n):S([],n),l.dateDropdownList.innerHTML=``;for(let i of n)l.dateDropdownList.appendChild(re(i,r,{selectedKey:t,today:e}))}async function ae(){f=new Set([Fe(O())]),await ie(),l.dateDropdown&&(l.dateDropdown.hidden=!1),l.datePicker?.setAttribute(`aria-expanded`,`true`),l.dateDropdownList?.querySelector(`.booking-date-option.is-selected`)?.scrollIntoView({block:`nearest`})}async function oe(){l.dateDropdown&&(l.dateDropdown.hidden?await ae():h())}function C(e,{silent:t=!1}={}){u=k(e),ze(u),g(),h(),y(),x(),t||c?.(u)}function de(){C(O())}return g(),v(u),x(),l.datePicker?.addEventListener(`click`,e=>{e.stopPropagation(),oe()},{signal:r}),l.datePicker?.addEventListener(`keydown`,e=>{e.key===`Enter`||e.key===` `?(e.preventDefault(),oe()):e.key===`Escape`&&h()},{signal:r}),l.dateDropdown?.addEventListener(`click`,e=>{e.stopPropagation()},{signal:r}),l.dateToday?.addEventListener(`click`,e=>{e.stopPropagation(),de()},{signal:r}),document.addEventListener(`click`,()=>{h()},{signal:r}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&h()},{signal:r}),l.dateLeft?.addEventListener(`click`,()=>{C(Ae(u,-1))},{signal:r}),l.dateRight?.addEventListener(`click`,()=>{C(Ae(u,1))},{signal:r}),{getDate:()=>new Date(u),setDate:(e,t)=>C(e,t),refresh:()=>{y(),x()},setHeaderUnavailable:ee,closeDropdown:h,destroy:async()=>{h(),await b()}}}var M=null,N=null,Ge=null,P=null,F=null,Ke=null,qe={dateLeft:`booking-list-date-left`,dateRight:`booking-list-date-right`,datePicker:`booking-date-picker`,dateHeader:`booking-list-header`,headerPax:`booking-header-pax`,dateDropdown:`booking-date-dropdown`,dateDropdownList:`booking-date-dropdown-list`,dateToday:`booking-date-today`},Je=()=>document.getElementById(`view-manager`);function Ye(e){let t=new Map;for(let n of e){let e=ne(n.datetime),r=t.get(e)??C();oe(r,n),t.set(e,r)}return t}function Xe(e,t,n,r){let i=`timeslot-group-${e}`,a=document.getElementById(i);if(!a){a=document.createElement(`section`),a.id=i,a.className=`booking-timeslot-group`;let e=document.createElement(`div`);e.className=`booking-timeslot-heading`,e.innerHTML=`
        <div class="booking-summary-primary">
            <span class="booking-timeslot-time">${ie(t)}</span>
            <span class="booking-summary-pax">${E(n)}</span>
        </div>`;let o=document.createElement(`div`);o.className=`booking-timeslot-items`,a.append(e,o),r.appendChild(a)}return a.querySelector(`.booking-timeslot-items`)}async function Ze(e,t){let n=ae(t);await y(F,e,d(),n)}function Qe(e,t){let n=Je();if(!n)return;let r=n.querySelector(`#booking-list`);if(e.length===0){r.innerHTML=`<p>No bookings for today. (or they are still downloading)</p>`;return}r.innerHTML=``;let i=Ye(e);e.forEach(e=>{let t=ne(e.datetime),n=Xe(t,e.datetime,i.get(t),r),a=``;e.preference!==`none`&&(a=`<div class="booking-detail-preference">${e.preference.charAt(0).toUpperCase()+e.preference.slice(1)}</div>`);let o=x(e.status),s=S(e.status),c=`<button type="button" class="booking-detail-status ${o}" data-id="${e.id}">${s}</button>`,l=document.createElement(`div`);l.className=`booking-list-item-card`,l.innerHTML=`
            <div class="booking-summary-primary">
                <div class="booking-detail-time-preference">
                    <span class="booking-summary-name">${e.first_name} ${e.last_name}</span>
                    ${a}
                </div>
                <span class="booking-summary-time">${ie(e.datetime)}</span>
                <span class="booking-summary-pax">
                    ${E(e)}
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
        `,l.addEventListener(`click`,()=>{l.querySelector(`.booking-list-item-details`).classList.toggle(`is-expanded`)}),l.querySelector(`.booking-detail-status`).addEventListener(`click`,async t=>{t.stopPropagation(),await Ze(t.currentTarget.getAttribute(`data-id`),e.status)}),l.querySelector(`.booking-action-delete`).addEventListener(`click`,async t=>{t.stopPropagation(),confirm(`Are you sure you want to delete this booking?`)&&await b(F,e.id,d())}),l.querySelector(`.booking-action-edit`).addEventListener(`click`,e=>{e.stopPropagation();let t=e.target.getAttribute(`data-id`);Ke?.(`create`,{edit:t})}),n.appendChild(l)});let{dayTotal:a,lunch:o,dinner:s}=le(e),c=document.createElement(`section`);c.className=`booking-timeslot-group booking-day-total`,c.innerHTML=`
        <div class="booking-timeslot-heading">
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Lunch Total Pax</span>
                ${Ee(o)}
            </div>
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Dinner Total Pax</span>
                ${Ee(s)}
            </div>
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Total Pax</span>
                ${Ee(a)}
            </div>
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Total Bookings</span>
                ${e.length}
            </div>
        </div>
    `,r.appendChild(c)}function $e(){let e=Je();if(!e)return;let t=e.querySelector(`#booking-notice`),n=e.querySelector(`#booking-list`);t.hidden=!1,t.textContent=`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.`,n.innerHTML=``,P?.setHeaderUnavailable()}async function et(){if(N&&=(await N.close(),null),!o()){$e();return}let e=Je();if(!e||!P)return;P.refresh();let t=e.querySelector(`#booking-notice`);t.hidden=!0;let n=P.getDate(),{start:r,end:i}=He(n),a=d();N=F.query({sql:`SELECT * FROM bookings
                  WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
                  ORDER BY datetime, last_name`,parameters:[a,w(r),w(i)]}).watch(),N.registerListener({onData:e=>Qe(e,n)})}async function tt(e){F=e.db,Ke=e.onNavigate,M=new AbortController;let{signal:t}=M,n=Je();n&&(P=We({viewRoot:n,db:F,signal:t,ids:qe,unavailableHeaderText:`Bookings unavailable`,onDateChange:()=>{et()}}),Ge=e.registerOnAccountSwitch(()=>{et()}),await et())}async function nt(){N&&=(await N.close(),null),await P?.destroy(),P=null,M?.abort(),M=null,Ge?.(),Ge=null,F=null,Ke=null}async function rt(e,t){return e.getAll(`SELECT id, name, pax_max FROM tables
         WHERE restaurant_id = ?
         ORDER BY name`,[t])}async function it(t){let{supabase:n}=await e(async()=>{let{supabase:e}=await import(`./supabaseClient-CtHlCuI7.js`);return{supabase:e}},__vite__mapDeps([0,1,2])),{data:r,error:i}=await n.from(`tables`).select(`id, name, pax_max`).eq(`restaurant_id`,t).order(`name`);if(i)throw i;return r??[]}function at(e){return e.pax_max==null?e.name:`${e.name} (${e.pax_max} max)`}function ot(e){return e<=0?`Delete this table?`:`This table is assigned to ${e} ${e===1?`booking`:`bookings`}. Deleting it will set those bookings to None. Continue?`}async function st(t){if(!n())throw Error(`Adding tables requires an internet connection.`);let{supabase:r}=await e(async()=>{let{supabase:e}=await import(`./supabaseClient-CtHlCuI7.js`);return{supabase:e}},__vite__mapDeps([0,1,2])),{error:i}=await r.from(`tables`).insert({restaurant_id:t.restaurant_id,name:t.name,pax_max:t.pax_max});if(i)throw i}async function ct(t,r,i){if(!n())throw Error(`Updating tables requires an internet connection.`);let{supabase:a}=await e(async()=>{let{supabase:e}=await import(`./supabaseClient-CtHlCuI7.js`);return{supabase:e}},__vite__mapDeps([0,1,2])),{error:o}=await a.from(`tables`).update({name:r.name,pax_max:r.pax_max}).eq(`id`,t).eq(`restaurant_id`,i);if(o)throw o}async function lt(e,t,n){return(await e.get(`SELECT COUNT(*) AS count FROM bookings
         WHERE table_id = ? AND restaurant_id = ?`,[t,n]))?.count??0}async function ut(e,t,n){await e.execute(`UPDATE bookings SET table_id = NULL
         WHERE table_id = ? AND restaurant_id = ?`,[t,n])}async function dt(t,r,i){if(await ut(t,r,i),!n())throw Error(`Deleting tables requires an internet connection.`);let{supabase:a}=await e(async()=>{let{supabase:e}=await import(`./supabaseClient-CtHlCuI7.js`);return{supabase:e}},__vite__mapDeps([0,1,2])),{error:o}=await a.from(`tables`).delete().eq(`id`,r).eq(`restaurant_id`,i);if(o)throw o}function ft(e,t){let n=e.querySelector(`option[value=""]`);if(e.innerHTML=``,n)e.appendChild(n);else{let t=document.createElement(`option`);t.value=``,t.selected=!0,t.textContent=`None`,e.appendChild(t)}for(let n of t){let t=document.createElement(`option`);t.value=String(n.id),t.textContent=at(n),e.appendChild(t)}}async function pt(e,t){let r=await rt(e,t);return r.length>0||!n()?r:it(t)}var mt=null,ht=null,I=null,L=null,gt=null,_t={dateLeft:`create-booking-list-date-left`,dateRight:`create-booking-list-date-right`,datePicker:`create-booking-date-picker`,dateHeader:`create-booking-list-header`,headerPax:`create-booking-header-pax`,dateDropdown:`create-booking-date-dropdown`,dateDropdownList:`create-booking-date-dropdown-list`,dateToday:`create-booking-date-today`},R=()=>document.getElementById(`view-create`);function vt(){let e=R();if(!e)return;let t=e.querySelector(`#bookingForm`);t.reset();let n=e.querySelector(`#create-booking-notice`),r=e.querySelector(`#timeslot`),i=e.querySelector(`#bookingDate`);n.hidden=!0,n.textContent=``,_(r),i.value=j(I?.getDate()??new Date);let a=e.querySelector(`#tableId`);a&&(a.value=``),t.querySelectorAll(`input, select, textarea, button`).forEach(e=>{e.disabled=!1})}function yt(){let e=R();if(!e)return!1;let t=e.querySelector(`#bookingForm`),n=e.querySelector(`#create-booking-notice`);return o()?(n.hidden=!0,t.querySelectorAll(`input, select, textarea, button`).forEach(e=>{e.disabled=!1}),!0):(n.hidden=!1,n.textContent=`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant before creating bookings.`,t.querySelectorAll(`input, select, textarea, button`).forEach(e=>{e.disabled=!0}),!1)}async function bt(){let e=R();if(!e||!L)return;let t=e.querySelector(`#tableId`);if(!t)return;if(!o()){ft(t,[]);return}let n=d();ft(t,await pt(L,n))}async function xt(e,t){let n=R();if(!n)return;let r=n.querySelector(`#bookingDate`),i=n.querySelector(`#timeslot`),a=n.querySelector(`#firstName`),o=n.querySelector(`#lastName`),s=n.querySelector(`#phoneNumber`),c=n.querySelector(`#email`),l=n.querySelector(`#totalPax`),u=n.querySelector(`#adultPax`),f=n.querySelector(`#childPax`),p=n.querySelector(`#hcPax`),m=n.querySelector(`#preference`),h=n.querySelector(`#tableId`),g=n.querySelector(`#additionalDetails`),_=d(),v=await de(L,e,_);if(!v){gt?.(`manager`,{replace:!0});return}t.editingId=e,t.editingStatus=v.status,r.value=ce(v.datetime),I?.setDate(Ie(r.value)??new Date,{silent:!0}),i.value=ne(v.datetime),a.value=v.first_name,o.value=v.last_name,s.value=v.phone_number??``,c.value=v.email??``,l.value=v.total_pax,u.value=v.adult_pax,f.value=v.child_pax,p.value=v.hc_pax,m.value=v.preference??`none`,h&&(h.value=v.table_id==null?``:String(v.table_id)),g.value=v.notes??``}function St(e){let t=e.querySelector(`#totalPax`),n=e.querySelector(`#childPax`),r=e.querySelector(`#hcPax`),i=e.querySelector(`#adultPax`),a=parseInt(t.value,10)||0,o=parseInt(n.value,10)||0,s=parseInt(r.value,10)||0,c=a-o-s;c<0&&(c=0),i.value=c}async function Ct(e){L=e.db,gt=e.onNavigate,mt=new AbortController;let{signal:n}=mt,r=R();if(!r)return;let i=r.querySelector(`#bookingForm`);r.querySelector(`#timeslot`);let a=r.querySelector(`#totalPax`),s=r.querySelector(`#childPax`),c=r.querySelector(`#hcPax`),l=r.querySelector(`#bookingDate`),u={editingId:null,editingStatus:t.PENDING},f=!1;I=We({viewRoot:r,db:L,signal:n,ids:_t,onDateChange:e=>{f||=(f=!0,l.value=j(e),!1)}}),vt(),l.addEventListener(`change`,()=>{if(f)return;let e=Ie(l.value);e&&(f=!0,I?.setDate(e,{silent:!0}),f=!1)},{signal:n});let m=()=>St(r);a.addEventListener(`change`,m,{signal:n}),s.addEventListener(`change`,m,{signal:n}),c.addEventListener(`change`,m,{signal:n}),ht=e.registerOnAccountSwitch(()=>{yt(),I?.refresh(),bt()}),window.addEventListener(`online`,()=>{o()&&bt()},{signal:n}),yt()&&(await bt(),e.editId&&await xt(e.editId,u)),i.addEventListener(`submit`,async e=>{if(e.preventDefault(),!o())return;let n=r.querySelector(`#bookingDate`),i=r.querySelector(`#timeslot`),a=r.querySelector(`#firstName`),s=r.querySelector(`#lastName`),c=r.querySelector(`#phoneNumber`),l=r.querySelector(`#email`),f=r.querySelector(`#totalPax`),m=r.querySelector(`#adultPax`),h=r.querySelector(`#childPax`),g=r.querySelector(`#hcPax`),_=r.querySelector(`#preference`),y=r.querySelector(`#tableId`),b=r.querySelector(`#additionalDetails`),x=y?.value??``,S=x===``?null:parseInt(x,10),te={first_name:a.value,last_name:s.value,phone_number:c.value,email:l.value,total_pax:parseInt(f.value,10),adult_pax:parseInt(m.value,10),child_pax:parseInt(h.value,10),hc_pax:parseInt(g.value,10),preference:_.value,notes:b.value,datetime:ee(n.value,i.value),status:u.editingId?u.editingStatus:t.PENDING,table_id:S};u.editingId?await fe(L,u.editingId,te,d()):await v(L,{...te,profile_id:p(),restaurant_id:d(),id:crypto.randomUUID(),created_at:w(new Date)}),gt?.(`manager`)},{signal:n})}async function wt(){await I?.destroy(),I=null,mt?.abort(),mt=null,ht?.(),ht=null,L=null,gt=null}var Tt=null;async function Et(e){Tt=new AbortController}async function Dt(){Tt?.abort(),Tt=null}var Ot=null,z=null,kt=null,At=null,B=0,V=()=>document.getElementById(`view-metrics`);function jt(e,t){let n=new Date(t);return n.setDate(n.getDate()-1),`${e.toLocaleDateString(`en-AU`,{weekday:`short`,day:`numeric`,month:`short`})} - ${n.toLocaleDateString(`en-AU`,{weekday:`short`,day:`numeric`,month:`short`,year:`numeric`})}`}function Mt(e,t){return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}function Nt(e,t,n){let r=V()?.querySelector(`#metrics-header`),i=V()?.querySelector(`#metrics-table`);if(!r||!i)return;r.textContent=jt(t,n);let{days:a,lunchTotal:o,dinnerTotal:s,weekendTotal:c,weekTotal:l}=re(e,t),u=new Date;u.setHours(0,0,0,0),i.innerHTML=`
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
            <tr class="${Mt(e.date,u)?`metrics-row--today`:``}">
                <th scope="row">${e.date.toLocaleDateString(`en-AU`,{weekday:`long`,day:`numeric`,month:`short`})}</th>
                <td>${D(e.lunch)}</td>
                <td>${D(e.dinner)}</td>
                <td>${D(e.dayTotal)}</td>
            </tr>
        `).join(``)}
            </tbody>
            <tfoot>
                <tr class="metrics-row--summary">
                    <th scope="row">Week total</th>
                    <td>${D(o)}</td>
                    <td>${D(s)}</td>
                    <td>${D(l)}</td>
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
                    <td>${D(c)}</td>
                </tr>
                <tr class="metrics-row--summary">
                    <th scope="row">Week total</th>
                    <td>${D(l)}</td>
                </tr>
            </tbody>
        </table>
    `}function Pt(){let e=V()?.querySelector(`#metrics-notice`),t=V()?.querySelector(`#metrics-table`),n=V()?.querySelector(`#metrics-header`);!e||!t||!n||(e.hidden=!1,e.textContent=`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.`,t.innerHTML=``,n.textContent=`Metrics unavailable`)}async function Ft(){if(!At)return;z&&=(await z.close(),null);let e=V()?.querySelector(`#metrics-notice`);if(!o()){Pt();return}e&&(e.hidden=!0);let{start:t,end:n}=te(new Date,B),r=d();z=At.query({sql:`SELECT * FROM bookings
                  WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
                  ORDER BY datetime`,parameters:[r,w(t),w(n)]}).watch(),z.registerListener({onData:e=>Nt(e,t,n)})}async function It(e){At=e.db,Ot=new AbortController;let{signal:t}=Ot;B=0,V()?.querySelector(`#metrics-week-left`)?.addEventListener(`click`,()=>{--B,Ft()},{signal:t}),V()?.querySelector(`#metrics-week-right`)?.addEventListener(`click`,()=>{B+=1,Ft()},{signal:t}),kt=e.registerOnAccountSwitch(()=>{Ft()}),await Ft()}async function Lt(){kt?.(),kt=null,z&&=(await z.close(),null),Ot?.abort(),Ot=null,At=null,B=0}var Rt=null,H=null,zt=null,U=null,W=null,G=[],K=0,Bt=`Table changes require an internet connection. You can still view synced tables and assign them to bookings offline.`,Vt=`No tables synced yet. Connect online once to download tables for offline use.`,q=()=>document.getElementById(`view-tables`);function Ht(e){q()?.querySelector(`#table-form`)?.querySelectorAll(`input, button`).forEach(t=>{t.disabled=e})}function Ut(){W=null;let e=q()?.querySelector(`#table-form`),t=q()?.querySelector(`#table-form-heading`),n=q()?.querySelector(`#table-save-btn`),r=q()?.querySelector(`#table-cancel-btn`);e?.reset(),t&&(t.textContent=`Add Table`),n&&(n.textContent=`Save Table`),r&&(r.hidden=!0)}function J(e){let t=q()?.querySelector(`#tables-notice`);t&&(t.hidden=!1,t.textContent=e)}function Wt(){let e=q()?.querySelector(`#tables-notice`);e&&(e.hidden=!0,e.textContent=``)}function Gt(){J(`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.`);let e=q()?.querySelector(`#tables-list`);e&&(e.innerHTML=``),G=[],Ht(!0)}function Y(){if(!o())return;let e=!n();if(Ht(e),e){J(Bt);return}Wt()}function Kt(e){let t=e.trim();if(t===``)return null;let n=parseInt(t,10);return Number.isNaN(n)?null:n}async function qt(){if(!U||!o()||!n())return;let e=++K,t=d();try{let n=await it(t);if(e!==K)return;X(n)}catch{e===K&&X(G)}}async function Jt(e){if(!o()){X(e);return}if(n()){await qt();return}X(e)}function Yt(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function X(e){let t=q()?.querySelector(`#tables-list`);if(!t)return;G=e;let r=!n();if(e.length===0){t.innerHTML=`<p class="tables-empty">No tables configured yet.</p>`,n()?o()&&Wt():J(Vt);return}n()&&o()&&Wt(),t.innerHTML=`
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
                <td>${Yt(at(e))}</td>
                <td>${Yt(t)}</td>
                <td class="tables-actions">
                    <button type="button" class="tables-edit-btn" data-id="${e.id}"${n}>Edit</button>
                    <button type="button" class="tables-delete-btn" data-id="${e.id}"${n}>Delete</button>
                </td>
            </tr>
        `}).join(``)}</tbody>
        </table>
    `,r&&o()&&J(Bt)}function Xt(e){W=e.id;let t=q()?.querySelector(`#table-name`),n=q()?.querySelector(`#table-pax-max`),r=q()?.querySelector(`#table-form-heading`),i=q()?.querySelector(`#table-save-btn`),a=q()?.querySelector(`#table-cancel-btn`);t&&(t.value=e.name),n&&(n.value=e.pax_max==null?``:String(e.pax_max)),r&&(r.textContent=`Edit Table`),i&&(i.textContent=`Update Table`),a&&(a.hidden=!1),t?.focus()}async function Zt(){if(!U)return;if(H&&=(await H.close(),null),Ut(),!o()){Gt();return}Y();let e=d();H=U.query({sql:`SELECT id, name, pax_max FROM tables
                  WHERE restaurant_id = ?
                  ORDER BY name`,parameters:[e]}).watch(),H.registerListener({onData:e=>{Jt(e)}})}async function Qt(e){U=e.db,Rt=new AbortController;let{signal:t}=Rt;G=[],K=0,q()?.querySelector(`#tables-list`)?.addEventListener(`click`,async e=>{let t=e.target;if(!(t instanceof HTMLElement)||!U||!o()||!n())return;let r=d(),i=t.closest(`.tables-edit-btn`),a=t.closest(`.tables-delete-btn`);if(i){let e=parseInt(i.getAttribute(`data-id`)??``,10),t=G.find(t=>t.id===e);t&&Xt(t);return}if(a){let e=parseInt(a.getAttribute(`data-id`)??``,10);if(Number.isNaN(e))return;try{let t=ot(await lt(U,e,r));if(!window.confirm(t))return;await dt(U,e,r),W===e&&Ut(),await qt()}catch(e){J(e.message??`Could not delete table.`)}}},{signal:t}),q()?.querySelector(`#table-cancel-btn`)?.addEventListener(`click`,()=>{Ut(),Y()},{signal:t}),q()?.querySelector(`#table-form`)?.addEventListener(`submit`,async e=>{if(e.preventDefault(),!U||!o())return;if(!n()){J(Bt);return}let t=d(),r=q()?.querySelector(`#table-name`),i=q()?.querySelector(`#table-pax-max`),a=r?.value.trim()??``,s=Kt(i?.value??``);if(!a){J(`Table name is required.`);return}try{W==null?(await st({restaurant_id:t,name:a,pax_max:s}),q()?.querySelector(`#table-form`)?.reset(),await qt()):(await ct(W,{name:a,pax_max:s},t),Ut(),await qt()),Wt(),Y()}catch(e){J(e.message??`Could not save table.`)}},{signal:t}),window.addEventListener(`online`,()=>{Y(),G.length>0&&X(G)},{signal:t}),window.addEventListener(`offline`,()=>{Y(),G.length>0&&X(G)},{signal:t}),zt=e.registerOnAccountSwitch(()=>{Zt()}),await Zt()}async function $t(){zt?.(),zt=null,H&&=(await H.close(),null),Rt?.abort(),Rt=null,U=null,W=null,G=[],K=0}var en=null,tn=null,Z=null,Q=()=>document.getElementById(`view-sync-status`);function nn(e){return e?new Date(e).toLocaleString():`—`}function rn(e){return e==null?``:e<1024?`${e} B`:`${(e/1024).toFixed(1)} kB`}function an(e){return e===`offline`?`Offline`:e===`warning`?`Attention needed`:`Up to date`}function $(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function on(e){let t=Q()?.querySelector(`#sync-status-summary`);if(!t)return;let n=e.online?e.connected?`Connected`:e.connecting?`Connecting…`:`Disconnected`:`Offline`;t.innerHTML=`
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
            <span class="sync-status-metric-value">${nn(e.lastSyncedAt)}</span>
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
    `}function cn(e){let t=Q()?.querySelector(`#sync-status-uploads-list`);if(t){if(e.pendingUploads.length===0){t.innerHTML=`<p class="sync-status-empty">No pending uploads${e.uploadQueueSize==null?``:` (${rn(e.uploadQueueSize)})`}</p>`;return}t.innerHTML=(e.uploadQueueSize==null?``:`<p class="sync-status-queue-size">Queue size: ${rn(e.uploadQueueSize)}</p>`)+e.pendingUploads.map(sn).join(``)}}function ln(e){let t=Q()?.querySelector(`#sync-status-downloads-list`);if(!t)return;let n=[],r=e.dataFlowStatus??{};if(r.downloading&&e.downloadProgress){let t=Math.round(e.downloadProgress.downloadedFraction*100);n.push(`
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
                <p class="sync-status-item-meta">Last synced: ${nn(e.lastSyncedAt)}</p>
                ${e.bookingCount==null?``:`<p class="sync-status-item-meta">${e.bookingCount} booking(s) stored locally</p>`}
            </article>
        `);let i=a();if(i.length>0){n.push(`<h3 class="sync-status-activity-heading">Recent download activity</h3>`);for(let e of i)n.push(`
                <article class="sync-status-item">
                    <p class="sync-status-item-detail">${nn(e.at)}</p>
                    <p class="sync-status-item-meta">${e.operations==null?`Download completed`:`${e.operations} operations received`}</p>
                </article>
            `)}r.uploading&&n.unshift(`<p class="sync-status-active-label">Uploading changes…</p>`),t.innerHTML=n.length?n.join(``):`<p class="sync-status-empty">No download activity</p>`}function un(e){let t=Q()?.querySelector(`#sync-status-issues-list`);if(!t)return;let n=[],r=e.dataFlowStatus??{};r.downloadError&&n.push(`
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
                <p class="sync-status-issue-meta">${nn(e.at)}</p>
            </article>
        `);t.innerHTML=n.length?n.join(``):`<p class="sync-status-empty">No issues detected</p>`}function dn(e){on(e),cn(e),ln(e),un(e)}function fn(e,t){!e||!Z||(e.disabled=!1,navigator.onLine?t&&Z.connected?e.textContent=`Reconnect`:e.textContent=`Failed to connect`:e.textContent=`Offline`)}async function pn(e){Z=e.db,en=new AbortController;let{signal:t}=en,n=Q()?.querySelector(`#sync-status-reconnect-btn`);n?.addEventListener(`click`,async()=>{if(!n||!Z)return;n.disabled=!0,n.textContent=`Reconnecting...`;let e=null;try{e=await m(Z)}finally{fn(n,e)}},{signal:t}),window.addEventListener(`online`,()=>{n?.textContent===`Offline`&&(n.textContent=`Reconnect`)},{signal:t}),tn=r(dn)}async function mn(){tn?.(),tn=null,en?.abort(),en=null,Z=null}var{name:hn}=T(),gn=null,_n=Te({...await xe({initialRoute:hn,onNavigate:(e,t)=>gn?.(e,t)}),views:{manager:{mount:tt,unmount:nt},create:{mount:Ct,unmount:wt},walkin:{mount:Et,unmount:Dt},metrics:{mount:It,unmount:Lt},tables:{mount:Qt,unmount:$t},"sync-status":{mount:pn,unmount:mn}}});gn=_n.navigate,await _n.start();