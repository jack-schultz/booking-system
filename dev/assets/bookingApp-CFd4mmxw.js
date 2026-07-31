const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/supabaseClient-jAmk_zrl.js","assets/supabaseClient-Cll7b3zd.js","assets/preload-helper-j_ZwnIYB.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill-Dezn_h7o.js";import{t as e}from"./supabaseClient-Cll7b3zd.js";import{t}from"./preload-helper-j_ZwnIYB.js";import{a as n,d as r,f as i,h as a,o}from"./accounts-BuezXnYs.js";import{t as s}from"./demoMode-CoIFBWVB.js";import"./register-CxERNST-.js";import{a as c,n as l,r as u,t as d}from"./accountSwitcher-ByOEp5dr.js";/* empty css              */import{i as f,n as p,t as m}from"./syncStatus-qhuH8S_9.js";import{i as h,n as g,t as _}from"./footer-Ikkn-b9o.js";import{i as v}from"./sync-BStlLJxw.js";import{n as ee,t as te}from"./db-BDFHS0_A.js";import{C as y,_ as b,a as ne,b as re,c as x,d as ie,f as ae,g as S,h as oe,i as C,l as se,m as ce,n as le,o as ue,p as de,r as fe,s as pe,t as me,u as he,v as ge,x as _e,y as w}from"./bookings-BHiAX5pL.js";var ve=[{name:`manager`,label:`BOOKINGS`,className:`booking-sidebar-nav-link--bookings`},{name:`create`,label:`NEW BOOKING`,className:`booking-sidebar-nav-link--new-booking`},{name:`walkin`,label:`WALK-IN`,className:`booking-sidebar-nav-link--walk-in`}];function ye(e,{activeRoute:t,onNavigate:n,showSaveButton:r=!1}={}){if(!e)return;let i=r?`<button type="submit" form="bookingForm" class="booking-sidebar-nav-link booking-sidebar-nav-link--save">SAVE BOOKING</button>`:``;e.innerHTML=ve.map(({name:e,label:n,className:r})=>{let i=t===e;return`<button type="button" class="booking-sidebar-nav-link ${r}${i?` is-active`:``}" data-route="${e}"${i?` aria-current="page"`:``}>${n}</button>`}).join(``)+i,e.querySelectorAll(`[data-route]`).forEach(e=>{e.addEventListener(`click`,()=>{let r=e.getAttribute(`data-route`);r&&r!==t&&n?.(r)})})}function be(e,t={}){let n=document.createElement(`nav`);n.className=`booking-sidebar-nav`,e.replaceWith(n),ye(n,t)}function xe(e={}){ye(document.querySelector(`.booking-sidebar-nav`),e)}function Se(){if(document.getElementById(`demo-banner`))return;document.body.classList.add(`demo-mode`);let e=document.createElement(`div`);e.id=`demo-banner`,e.className=`demo-banner`,e.setAttribute(`role`,`status`),e.innerHTML=`<strong>Demo account</strong> · Shared sandbox · Max 15 bookings · Resets periodically · <a href="../signup.html">Sign up for a real account</a>`;let t=document.querySelector(`.site-navbar`),n=document.querySelector(`.page-content`);t?.parentNode?t.parentNode.insertBefore(e,t.nextSibling):n?n.parentNode.insertBefore(e,n):document.body.prepend(e)}var Ce=new Set,we=new Set([`manager`,`create`,`walkin`]);function Te(e){for(let t of Ce)t(e)}function Ee(e){let t=document.getElementById(`booking-shell-layout`),n=document.getElementById(`booking-sidebar-panel`),r=we.has(e);t?.classList.toggle(`booking-page-layout--no-sidebar`,!r),n&&(n.hidden=!r)}async function De({initialRoute:t,onNavigate:i}){g(document.getElementById(`site-navbar-mount`),{basePath:`../`,activeRoute:t,onNavigate:i}),_(document.getElementById(`site-footer-mount`),{basePath:`../`}),be(document.getElementById(`booking-sidebar-mount`),{activeRoute:t,onNavigate:i,showSaveButton:t===`create`}),Ee(t);let a=u({requireAuth:!0,loginRedirect:`../login.html`,onSwitch:e=>Te(e)}),o=await ee();await a;let l=n();return l&&r()&&await c(e,l.id,{force:!0}),te(o),s(n())&&Se(),{db:o,registerOnAccountSwitch(e){return Ce.add(e),()=>Ce.delete(e)},setActiveRoute(e){Ee(e),h({activeRoute:e,onNavigate:i,basePath:`../`}),we.has(e)&&xe({activeRoute:e,onNavigate:i,showSaveButton:e===`create`})}}}var Oe={manager:`manager`,create:`create`,walkin:`walkin`,metrics:`metrics`,tables:`tables`,"sync-status":`sync-status`},ke=/\/booking\/(manager|create|walkin|metrics|tables|sync-status)\/?$/;function Ae(e=window.location){let t=e.pathname.replace(/\/$/,``),n=new URLSearchParams(e.search).get(`edit`),r=t.match(ke)?.[1]??`manager`;return{name:r,editId:r===`create`?n:null}}function je(e,{edit:t}={}){let n=Oe[e]??Oe.manager,r=new URL(`/booking-system/dev/booking/${n}`,window.location.origin);return t?r.searchParams.set(`edit`,t):r.searchParams.delete(`edit`),`${r.pathname}${r.search}`}function Me(e){let{db:t,registerOnAccountSwitch:n,setActiveRoute:r,views:i}=e,a=null,o={},s=!1,c={manager:document.getElementById(`view-manager`),create:document.getElementById(`view-create`),walkin:document.getElementById(`view-walkin`),metrics:document.getElementById(`view-metrics`),tables:document.getElementById(`view-tables`),"sync-status":document.getElementById(`view-sync-status`)};function l(e){for(let[t,n]of Object.entries(c))n&&(n.hidden=t!==e)}async function u(e,a={}){let o=i[e];if(!o)throw Error(`Unknown route: ${e}`);l(e),r(e),await o.mount({db:t,registerOnAccountSwitch:n,onNavigate:f,...a})}async function d(){if(!a)return;let e=i[a];e?.unmount&&await e.unmount()}async function f(e,{edit:t,replace:n=!1}={}){if(!s&&!(a===e&&(e!==`create`||(t??null)===o.editId))){s=!0;try{let r=je(e,{edit:t});n?history.replaceState({route:e,editId:t??null},``,r):history.pushState({route:e,editId:t??null},``,r),await d(),a=e,o={editId:t??null},await u(e,{editId:t??null})}finally{s=!1}}}async function p(){let{name:e,editId:t}=Ae();a=e,o={editId:t},l(e),r(e),await u(e,{editId:t}),window.addEventListener(`popstate`,async e=>{if(!s){s=!0;try{let t=e.state,n=t?.route??Ae().name,i=t?.editId??Ae().editId;await d(),a=n,o={editId:i},l(n),r(n),await u(n,{editId:i})}finally{s=!1}}})}return{start:p,navigate:f}}function Ne(e){let{total_pax:t,adult_pax:n,child_pax:r,hc_pax:i}=e;return`
        <span class="booking-summary-pax-total">${t}</span>
        <span class="booking-summary-pax-breakdown">
            <span>${n}A</span>
            <span>${r}C</span>
            <span>${i}HC</span>
        </span>
    `}function Pe(e){return`<span class="booking-summary-pax">${Ne(e)}</span>`}function T(e){return`<div class="metrics-pax-cell">${Ne(e)}</div>`}function Fe({dayTotal:e,lunch:t,dinner:n}){return`
        <span class="booking-summary-pax-total">${e.booking_count}-${e.total_pax}</span>
        <span class="booking-summary-pax-breakdown">
            <span>L${t.booking_count}-${t.total_pax}</span>
            <span>D${n.booking_count}-${n.total_pax}</span>
        </span>
    `}function Ie(e){return`<span class="booking-summary-pax">${Fe(e)}</span>`}var Le=12;function E(){let e=new Date;return e.setHours(0,0,0,0),e}function D(e){let t=new Date(e);return t.setHours(0,0,0,0),t}function Re(e,t){let n=new Date(e);return n.setDate(n.getDate()+t),n}function ze(e){let t=D(e);return t.setDate(1),t}function Be(e,t){let n=ze(e);return n.setMonth(n.getMonth()+t),n}function Ve(e){let t=ze(e),n=[],r=new Date(t);for(;r.getMonth()===t.getMonth();)n.push(new Date(r)),r.setDate(r.getDate()+1);return n}function He(){let e=E(),t=[];for(let n=-1;n<=Le;n+=1)t.push(Be(e,n));return t}function Ue(e){return{start:ze(e[0]),end:Be(ze(e[e.length-1]),1)}}function O(e){let t=D(e);return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,`0`)}-${String(t.getDate()).padStart(2,`0`)}`}function We(e){let t=D(e);return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,`0`)}`}function Ge(e){if(!/^\d{4}-\d{2}-\d{2}$/.test(e))return null;let t=new Date(`${e}T00:00:00`);return Number.isNaN(t.getTime())?null:t}function Ke(e,t){return O(e)===O(t)}function qe(){return Ge(localStorage.getItem(a.MANAGER_SELECTED_DATE))??E()}function Je(e){localStorage.setItem(a.MANAGER_SELECTED_DATE,O(e))}function Ye(e){return e.toLocaleDateString(`en-AU`,{weekday:`short`,day:`numeric`})}function Xe(e){return e.toLocaleDateString(`en-AU`,{month:`short`,year:`numeric`})}function Ze(e){let t=new Date(e);t.setHours(0,0,0,0);let n=new Date(t);return n.setDate(n.getDate()+1),{start:t,end:n}}function Qe(e){return e.toLocaleDateString(`en-AU`,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`})}function $e(e){let{viewRoot:t,db:n,signal:r,ids:i,initialDate:a,unavailableHeaderText:s,onDateChange:c}=e,u={dateLeft:t.querySelector(`#${i.dateLeft}`),dateRight:t.querySelector(`#${i.dateRight}`),datePicker:t.querySelector(`#${i.datePicker}`),dateHeader:t.querySelector(`#${i.dateHeader}`),headerPax:t.querySelector(`#${i.headerPax}`),dateDropdown:t.querySelector(`#${i.dateDropdown}`),dateDropdownList:t.querySelector(`#${i.dateDropdownList}`),dateToday:t.querySelector(`#${i.dateToday}`)},d=D(a??qe()),f=new Set([We(E())]),p=null,m=!1;function h(){u.dateDropdown&&(u.dateDropdown.hidden=!0),u.datePicker?.setAttribute(`aria-expanded`,`false`)}function g(){u.dateToday&&(u.dateToday.disabled=Ke(d,E()))}function _(e,t){if(!u.dateHeader||!u.headerPax)return;u.dateHeader.textContent=Qe(e);let{dayTotal:n,lunch:r,dinner:i}=fe(t);u.headerPax.innerHTML=Ie({dayTotal:n,lunch:r,dinner:i}),u.headerPax.hidden=!1}function v(e){if(!u.dateHeader||!u.headerPax)return;let{dayTotal:t,lunch:n,dinner:r}=ue();u.dateHeader.textContent=Qe(e),u.headerPax.innerHTML=Ie({dayTotal:t,lunch:n,dinner:r}),u.headerPax.hidden=!1}function ee(){m=!0,u.dateHeader&&(u.dateHeader.textContent=s??`Unavailable`),u.headerPax&&(u.headerPax.hidden=!0,u.headerPax.innerHTML=``)}function te(){m=!1}async function y(){p&&=(await p.close(),null)}async function b(){if(await y(),m)return;if(!o()){s?ee():v(d);return}let e=d,{start:t,end:r}=Ze(e),i=l();p=n.query({sql:`SELECT * FROM bookings
                      WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
                      ORDER BY datetime`,parameters:[i,w(t),w(r)]}).watch(),p.registerListener({onData:t=>_(e,t)})}function ne(e,t){let n=new Map;for(let e of t)for(let t of Ve(e))n.set(O(t),ue());for(let t of e){let e=ce(t.datetime),r=n.get(e);r&&me(r,t)}return n}async function re(e){let{start:t,end:r}=Ue(e);return n.getAll(`SELECT * FROM bookings
             WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
             ORDER BY datetime`,[l(),w(t),w(r)])}function x(e,{dayTotal:t,lunch:n,dinner:r},{selectedKey:i,today:a}){let o=O(e),s=document.createElement(`button`);return s.type=`button`,s.className=`booking-date-option`,s.role=`option`,s.innerHTML=`
            <span class="booking-date-option-label">${Ye(e)}</span>
            <span class="booking-date-option-pax">${Ie({dayTotal:t,lunch:n,dinner:r})}</span>
        `,o===i?(s.classList.add(`is-selected`),s.setAttribute(`aria-selected`,`true`)):s.setAttribute(`aria-selected`,`false`),Ke(e,a)&&s.classList.add(`is-today`),s.addEventListener(`click`,t=>{t.stopPropagation(),C(e)}),s}function ie(e,t,{selectedKey:n,today:r}){let i=We(e),a=f.has(i),o=document.createElement(`div`);o.className=`booking-date-month-group`,a&&o.classList.add(`is-expanded`);let s=document.createElement(`button`);s.type=`button`,s.className=`booking-date-month-toggle`,s.dataset.monthKey=i,s.setAttribute(`aria-expanded`,String(a)),s.innerHTML=`
            <span class="booking-month-separator-label">${Xe(e)}</span>
            <span class="booking-date-month-chevron" aria-hidden="true"></span>
        `;let c=document.createElement(`div`);c.className=`booking-date-month-days`,c.hidden=!a;for(let i of Ve(e)){let e=O(i),{dayTotal:a,lunch:o,dinner:s}=t.get(e)??ue();c.appendChild(x(i,{dayTotal:a,lunch:o,dinner:s},{selectedKey:n,today:r}))}return s.addEventListener(`click`,e=>{e.stopPropagation();let t=s.getAttribute(`aria-expanded`)!==`true`;s.setAttribute(`aria-expanded`,String(t)),c.hidden=!t,o.classList.toggle(`is-expanded`,t),t?f.add(i):f.delete(i)}),o.append(s,c),o}async function ae(){if(!u.dateDropdownList)return;let e=E(),t=O(d),n=He(),r=new Map;r=o()?ne(await re(n),n):ne([],n),u.dateDropdownList.innerHTML=``;for(let i of n)u.dateDropdownList.appendChild(ie(i,r,{selectedKey:t,today:e}))}async function S(){f=new Set([We(E())]),await ae(),u.dateDropdown&&(u.dateDropdown.hidden=!1),u.datePicker?.setAttribute(`aria-expanded`,`true`),u.dateDropdownList?.querySelector(`.booking-date-option.is-selected`)?.scrollIntoView({block:`nearest`})}async function oe(){u.dateDropdown&&(u.dateDropdown.hidden?await S():h())}function C(e,{silent:t=!1}={}){d=D(e),Je(d),g(),h(),te(),b(),t||c?.(d)}function se(){C(E())}return g(),v(d),b(),u.datePicker?.addEventListener(`click`,e=>{e.stopPropagation(),oe()},{signal:r}),u.datePicker?.addEventListener(`keydown`,e=>{e.key===`Enter`||e.key===` `?(e.preventDefault(),oe()):e.key===`Escape`&&h()},{signal:r}),u.dateDropdown?.addEventListener(`click`,e=>{e.stopPropagation()},{signal:r}),u.dateToday?.addEventListener(`click`,e=>{e.stopPropagation(),se()},{signal:r}),document.addEventListener(`click`,()=>{h()},{signal:r}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&h()},{signal:r}),u.dateLeft?.addEventListener(`click`,()=>{C(Re(d,-1))},{signal:r}),u.dateRight?.addEventListener(`click`,()=>{C(Re(d,1))},{signal:r}),{getDate:()=>new Date(d),setDate:(e,t)=>C(e,t),refresh:()=>{te(),b()},setHeaderUnavailable:ee,closeDropdown:h,destroy:async()=>{h(),await y()}}}var k=null,A=null,et=null,j=null,M=null,tt=null,nt={dateLeft:`booking-list-date-left`,dateRight:`booking-list-date-right`,datePicker:`booking-date-picker`,dateHeader:`booking-list-header`,headerPax:`booking-header-pax`,dateDropdown:`booking-date-dropdown`,dateDropdownList:`booking-date-dropdown-list`,dateToday:`booking-date-today`},N=()=>document.getElementById(`view-manager`);function rt(e){let t=new Map;for(let n of e){let e=S(n.datetime),r=t.get(e)??pe();le(r,n),t.set(e,r)}return t}function it(e,t,n,r){let i=`timeslot-group-${e}`,a=document.getElementById(i);if(!a){a=document.createElement(`section`),a.id=i,a.className=`booking-timeslot-group`;let e=document.createElement(`div`);e.className=`booking-timeslot-heading`,e.innerHTML=`
        <div class="booking-summary-primary">
            <span class="booking-timeslot-time">${se(t)}</span>
            <span class="booking-summary-pax">${Ne(n)}</span>
        </div>`;let o=document.createElement(`div`);o.className=`booking-timeslot-items`,a.append(e,o),r.appendChild(a)}return a.querySelector(`.booking-timeslot-items`)}async function at(e,t){let n=oe(t);await _e(M,e,l(),n)}function ot(e,t){let n=N();if(!n)return;let r=n.querySelector(`#booking-list`);if(e.length===0){r.innerHTML=`<p>No bookings for today. (or they are still downloading)</p>`;return}r.innerHTML=``;let i=rt(e);e.forEach(e=>{let t=S(e.datetime),n=it(t,e.datetime,i.get(t),r),a=``;e.preference!==`none`&&(a=`<div class="booking-detail-preference">${e.preference.charAt(0).toUpperCase()+e.preference.slice(1)}</div>`);let o=ie(e.status),s=ae(e.status),c=`<button type="button" class="booking-detail-status ${o}" data-id="${e.id}">${s}</button>`,u=document.createElement(`div`);u.className=`booking-list-item-card`,u.innerHTML=`
            <div class="booking-summary-primary">
                <div class="booking-detail-time-preference">
                    <span class="booking-summary-name">${e.first_name} ${e.last_name}</span>
                    ${a}
                </div>
                <span class="booking-summary-time">${se(e.datetime)}</span>
                <span class="booking-summary-pax">
                    ${Ne(e)}
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
        `,u.addEventListener(`click`,()=>{u.querySelector(`.booking-list-item-details`).classList.toggle(`is-expanded`)}),u.querySelector(`.booking-detail-status`).addEventListener(`click`,async t=>{t.stopPropagation(),await at(t.currentTarget.getAttribute(`data-id`),e.status)}),u.querySelector(`.booking-action-delete`).addEventListener(`click`,async t=>{t.stopPropagation(),confirm(`Are you sure you want to delete this booking?`)&&await x(M,e.id,l())}),u.querySelector(`.booking-action-edit`).addEventListener(`click`,e=>{e.stopPropagation();let t=e.target.getAttribute(`data-id`);tt?.(`create`,{edit:t})}),n.appendChild(u)});let{dayTotal:a,lunch:o,dinner:s}=fe(e),c=document.createElement(`section`);c.className=`booking-timeslot-group booking-day-total`,c.innerHTML=`
        <div class="booking-timeslot-heading">
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Lunch Total Pax</span>
                ${Pe(o)}
            </div>
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Dinner Total Pax</span>
                ${Pe(s)}
            </div>
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Total Pax</span>
                ${Pe(a)}
            </div>
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Total Bookings</span>
                ${e.length}
            </div>
        </div>
    `,r.appendChild(c)}function st(){let e=N();if(!e)return;let t=e.querySelector(`#booking-notice`),n=e.querySelector(`#booking-list`);t.hidden=!1,t.textContent=`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.`,n.innerHTML=``,j?.setHeaderUnavailable()}async function ct(){if(A&&=(await A.close(),null),!o()){st();return}let e=N();if(!e||!j)return;j.refresh();let t=e.querySelector(`#booking-notice`);t.hidden=!0;let n=j.getDate(),{start:r,end:i}=Ze(n),a=l();A=M.query({sql:`SELECT * FROM bookings
                  WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
                  ORDER BY datetime, last_name`,parameters:[a,w(r),w(i)]}).watch(),A.registerListener({onData:e=>ot(e,n)})}async function lt(e){M=e.db,tt=e.onNavigate,k=new AbortController;let{signal:t}=k,n=N();n&&(j=$e({viewRoot:n,db:M,signal:t,ids:nt,unavailableHeaderText:`Bookings unavailable`,onDateChange:()=>{ct()}}),et=e.registerOnAccountSwitch(()=>{ct()}),await ct())}async function ut(){A&&=(await A.close(),null),await j?.destroy(),j=null,k?.abort(),k=null,et?.(),et=null,M=null,tt=null}async function dt(e,t){return e.getAll(`SELECT id, name, pax_max FROM tables
         WHERE restaurant_id = ?
         ORDER BY name`,[t])}async function ft(e){let{supabase:n}=await t(async()=>{let{supabase:e}=await import(`./supabaseClient-jAmk_zrl.js`);return{supabase:e}},__vite__mapDeps([0,1,2])),{data:r,error:i}=await n.from(`tables`).select(`id, name, pax_max`).eq(`restaurant_id`,e).order(`name`);if(i)throw i;return r??[]}function pt(e){return e.pax_max==null?e.name:`${e.name} (${e.pax_max} max)`}function mt(e){return e<=0?`Delete this table?`:`This table is assigned to ${e} ${e===1?`booking`:`bookings`}. Deleting it will set those bookings to None. Continue?`}async function ht(e){if(!r())throw Error(`Adding tables requires an internet connection.`);let{supabase:n}=await t(async()=>{let{supabase:e}=await import(`./supabaseClient-jAmk_zrl.js`);return{supabase:e}},__vite__mapDeps([0,1,2])),{error:i}=await n.from(`tables`).insert({restaurant_id:e.restaurant_id,name:e.name,pax_max:e.pax_max});if(i)throw i}async function gt(e,n,i){if(!r())throw Error(`Updating tables requires an internet connection.`);let{supabase:a}=await t(async()=>{let{supabase:e}=await import(`./supabaseClient-jAmk_zrl.js`);return{supabase:e}},__vite__mapDeps([0,1,2])),{error:o}=await a.from(`tables`).update({name:n.name,pax_max:n.pax_max}).eq(`id`,e).eq(`restaurant_id`,i);if(o)throw o}async function _t(e,t,n){return(await e.get(`SELECT COUNT(*) AS count FROM bookings
         WHERE table_id = ? AND restaurant_id = ?`,[t,n]))?.count??0}async function vt(e,t,n){await e.execute(`UPDATE bookings SET table_id = NULL
         WHERE table_id = ? AND restaurant_id = ?`,[t,n])}async function yt(e,n,i){if(await vt(e,n,i),!r())throw Error(`Deleting tables requires an internet connection.`);let{supabase:a}=await t(async()=>{let{supabase:e}=await import(`./supabaseClient-jAmk_zrl.js`);return{supabase:e}},__vite__mapDeps([0,1,2])),{error:o}=await a.from(`tables`).delete().eq(`id`,n).eq(`restaurant_id`,i);if(o)throw o}function bt(e,t){let n=e.querySelector(`option[value=""]`);if(e.innerHTML=``,n)e.appendChild(n);else{let t=document.createElement(`option`);t.value=``,t.selected=!0,t.textContent=`None`,e.appendChild(t)}for(let n of t){let t=document.createElement(`option`);t.value=String(n.id),t.textContent=pt(n),e.appendChild(t)}}async function xt(e,t){let n=await dt(e,t);return n.length>0||!r()?n:ft(t)}var P=null,St=null,F=null,I=null,L=null,Ct={dateLeft:`create-booking-list-date-left`,dateRight:`create-booking-list-date-right`,datePicker:`create-booking-date-picker`,dateHeader:`create-booking-list-header`,headerPax:`create-booking-header-pax`,dateDropdown:`create-booking-date-dropdown`,dateDropdownList:`create-booking-date-dropdown-list`,dateToday:`create-booking-date-today`},R=()=>document.getElementById(`view-create`);function wt(){let e=R();if(!e)return;let t=e.querySelector(`#bookingForm`);t.reset();let n=e.querySelector(`#create-booking-notice`),r=e.querySelector(`#timeslot`),i=e.querySelector(`#bookingDate`);n.hidden=!0,n.textContent=``,y(r),i.value=O(F?.getDate()??new Date);let a=e.querySelector(`#tableId`);a&&(a.value=``),t.querySelectorAll(`input, select, textarea, button`).forEach(e=>{e.disabled=!1})}function Tt(){let e=R();if(!e)return!1;let t=e.querySelector(`#bookingForm`),n=e.querySelector(`#create-booking-notice`);return o()?(n.hidden=!0,t.querySelectorAll(`input, select, textarea, button`).forEach(e=>{e.disabled=!1}),!0):(n.hidden=!1,n.textContent=`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant before creating bookings.`,t.querySelectorAll(`input, select, textarea, button`).forEach(e=>{e.disabled=!0}),!1)}async function Et(){if(!I)return 0;let e=l();return(await de(I,new Date(`2000-01-01`),new Date(`2100-01-01`),e)).length}async function Dt(e){let t=R();if(!t||!s()||e.editingId)return!0;let n=t.querySelector(`#bookingForm`),r=t.querySelector(`#create-booking-notice`);return await Et()>=15?(r.hidden=!1,r.textContent=`Demo limit reached — maximum 15 bookings. Delete a booking or sign up for a real account to continue.`,n.querySelectorAll(`input, select, textarea, button`).forEach(e=>{e.disabled=!0}),!1):(o()&&(r.hidden=!0,r.textContent=``,n.querySelectorAll(`input, select, textarea, button`).forEach(e=>{e.disabled=!1})),!0)}async function Ot(){let e=R();if(!e||!I)return;let t=e.querySelector(`#tableId`);if(!t)return;if(!o()){bt(t,[]);return}let n=l();bt(t,await xt(I,n))}async function kt(e,t){let n=R();if(!n)return;let r=n.querySelector(`#bookingDate`),i=n.querySelector(`#timeslot`),a=n.querySelector(`#firstName`),o=n.querySelector(`#lastName`),s=n.querySelector(`#phoneNumber`),c=n.querySelector(`#email`),u=n.querySelector(`#totalPax`),d=n.querySelector(`#adultPax`),f=n.querySelector(`#childPax`),p=n.querySelector(`#hcPax`),m=n.querySelector(`#preference`),h=n.querySelector(`#tableId`),g=n.querySelector(`#additionalDetails`),_=l(),v=await he(I,e,_);if(!v){L?.(`manager`,{replace:!0});return}t.editingId=e,t.editingStatus=v.status,r.value=ce(v.datetime),F?.setDate(Ge(r.value)??new Date,{silent:!0}),i.value=S(v.datetime),a.value=v.first_name,o.value=v.last_name,s.value=v.phone_number??``,c.value=v.email??``,u.value=v.total_pax,d.value=v.adult_pax,f.value=v.child_pax,p.value=v.hc_pax,m.value=v.preference??`none`,h&&(h.value=v.table_id==null?``:String(v.table_id)),g.value=v.notes??``}function At(e){let t=e.querySelector(`#totalPax`),n=e.querySelector(`#childPax`),r=e.querySelector(`#hcPax`),i=e.querySelector(`#adultPax`),a=parseInt(t.value,10)||0,o=parseInt(n.value,10)||0,s=parseInt(r.value,10)||0,c=a-o-s;c<0&&(c=0),i.value=c}async function jt(e){I=e.db,L=e.onNavigate,P=new AbortController;let{signal:t}=P,n=R();if(!n)return;let r=n.querySelector(`#bookingForm`);n.querySelector(`#timeslot`);let a=n.querySelector(`#totalPax`),c=n.querySelector(`#childPax`),u=n.querySelector(`#hcPax`),f=n.querySelector(`#bookingDate`),p={editingId:null,editingStatus:i.PENDING},m=!1;F=$e({viewRoot:n,db:I,signal:t,ids:Ct,onDateChange:e=>{m||=(m=!0,f.value=O(e),!1)}}),wt(),f.addEventListener(`change`,()=>{if(m)return;let e=Ge(f.value);e&&(m=!0,F?.setDate(e,{silent:!0}),m=!1)},{signal:t});let h=()=>At(n);a.addEventListener(`change`,h,{signal:t}),c.addEventListener(`change`,h,{signal:t}),u.addEventListener(`change`,h,{signal:t}),St=e.registerOnAccountSwitch(()=>{Tt(),F?.refresh(),Ot()}),window.addEventListener(`online`,()=>{o()&&Ot()},{signal:t}),Tt()&&(await Ot(),e.editId?await kt(e.editId,p):await Dt(p)),r.addEventListener(`submit`,async e=>{if(e.preventDefault(),!o())return;if(!p.editingId&&s()&&await Et()>=15){let e=n.querySelector(`#create-booking-notice`);e.hidden=!1,e.textContent=`Demo limit reached. Maximum 15 bookings. Delete a booking or sign up for a real account to continue.`;return}let t=n.querySelector(`#bookingDate`),r=n.querySelector(`#timeslot`),a=n.querySelector(`#firstName`),c=n.querySelector(`#lastName`),u=n.querySelector(`#phoneNumber`),f=n.querySelector(`#email`),m=n.querySelector(`#totalPax`),h=n.querySelector(`#adultPax`),g=n.querySelector(`#childPax`),_=n.querySelector(`#hcPax`),v=n.querySelector(`#preference`),ee=n.querySelector(`#tableId`),te=n.querySelector(`#additionalDetails`),y=ee?.value??``,b=y===``?null:parseInt(y,10),x={first_name:a.value,last_name:c.value,phone_number:u.value,email:f.value,total_pax:parseInt(m.value,10),adult_pax:parseInt(h.value,10),child_pax:parseInt(g.value,10),hc_pax:parseInt(_.value,10),preference:v.value,notes:te.value,datetime:ne(t.value,r.value),status:p.editingId?p.editingStatus:i.PENDING,table_id:b};p.editingId?await re(I,p.editingId,x,l()):await ge(I,{...x,profile_id:d(),restaurant_id:l(),id:crypto.randomUUID(),created_at:w(new Date)}),L?.(`manager`)},{signal:t})}async function Mt(){await F?.destroy(),F=null,P?.abort(),P=null,St?.(),St=null,I=null,L=null}var Nt=null;async function Pt(e){Nt=new AbortController}async function Ft(){Nt?.abort(),Nt=null}var It=null,z=null,Lt=null,Rt=null,B=0,V=()=>document.getElementById(`view-metrics`);function zt(e,t){let n=new Date(t);return n.setDate(n.getDate()-1),`${e.toLocaleDateString(`en-AU`,{weekday:`short`,day:`numeric`,month:`short`})} - ${n.toLocaleDateString(`en-AU`,{weekday:`short`,day:`numeric`,month:`short`,year:`numeric`})}`}function Bt(e,t){return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}function Vt(e,t,n){let r=V()?.querySelector(`#metrics-header`),i=V()?.querySelector(`#metrics-table`);if(!r||!i)return;r.textContent=zt(t,n);let{days:a,lunchTotal:o,dinnerTotal:s,weekendTotal:c,weekTotal:l}=C(e,t),u=new Date;u.setHours(0,0,0,0),i.innerHTML=`
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
            <tr class="${Bt(e.date,u)?`metrics-row--today`:``}">
                <th scope="row">${e.date.toLocaleDateString(`en-AU`,{weekday:`long`,day:`numeric`,month:`short`})}</th>
                <td>${T(e.lunch)}</td>
                <td>${T(e.dinner)}</td>
                <td>${T(e.dayTotal)}</td>
            </tr>
        `).join(``)}
            </tbody>
            <tfoot>
                <tr class="metrics-row--summary">
                    <th scope="row">Week total</th>
                    <td>${T(o)}</td>
                    <td>${T(s)}</td>
                    <td>${T(l)}</td>
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
                    <td>${T(c)}</td>
                </tr>
                <tr class="metrics-row--summary">
                    <th scope="row">Week total</th>
                    <td>${T(l)}</td>
                </tr>
            </tbody>
        </table>
    `}function Ht(){let e=V()?.querySelector(`#metrics-notice`),t=V()?.querySelector(`#metrics-table`),n=V()?.querySelector(`#metrics-header`);!e||!t||!n||(e.hidden=!1,e.textContent=`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.`,t.innerHTML=``,n.textContent=`Metrics unavailable`)}async function Ut(){if(!Rt)return;z&&=(await z.close(),null);let e=V()?.querySelector(`#metrics-notice`);if(!o()){Ht();return}e&&(e.hidden=!0);let{start:t,end:n}=b(new Date,B),r=l();z=Rt.query({sql:`SELECT * FROM bookings
                  WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
                  ORDER BY datetime`,parameters:[r,w(t),w(n)]}).watch(),z.registerListener({onData:e=>Vt(e,t,n)})}async function Wt(e){Rt=e.db,It=new AbortController;let{signal:t}=It;B=0,V()?.querySelector(`#metrics-week-left`)?.addEventListener(`click`,()=>{--B,Ut()},{signal:t}),V()?.querySelector(`#metrics-week-right`)?.addEventListener(`click`,()=>{B+=1,Ut()},{signal:t}),Lt=e.registerOnAccountSwitch(()=>{Ut()}),await Ut()}async function Gt(){Lt?.(),Lt=null,z&&=(await z.close(),null),It?.abort(),It=null,Rt=null,B=0}var Kt=null,H=null,qt=null,U=null,W=null,G=[],K=0,Jt=`Table changes require an internet connection. You can still view synced tables and assign them to bookings offline.`,Yt=`No tables synced yet. Connect online once to download tables for offline use.`,q=()=>document.getElementById(`view-tables`);function Xt(e){q()?.querySelector(`#table-form`)?.querySelectorAll(`input, button`).forEach(t=>{t.disabled=e})}function Zt(){W=null;let e=q()?.querySelector(`#table-form`),t=q()?.querySelector(`#table-form-heading`),n=q()?.querySelector(`#table-save-btn`),r=q()?.querySelector(`#table-cancel-btn`);e?.reset(),t&&(t.textContent=`Add Table`),n&&(n.textContent=`Save Table`),r&&(r.hidden=!0)}function J(e){let t=q()?.querySelector(`#tables-notice`);t&&(t.hidden=!1,t.textContent=e)}function Qt(){let e=q()?.querySelector(`#tables-notice`);e&&(e.hidden=!0,e.textContent=``)}function $t(){J(`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.`);let e=q()?.querySelector(`#tables-list`);e&&(e.innerHTML=``),G=[],Xt(!0)}function Y(){if(!o())return;let e=!r();if(Xt(e),e){J(Jt);return}Qt()}function en(e){let t=e.trim();if(t===``)return null;let n=parseInt(t,10);return Number.isNaN(n)?null:n}async function tn(){if(!U||!o()||!r())return;let e=++K,t=l();try{let n=await ft(t);if(e!==K)return;X(n)}catch{e===K&&X(G)}}async function nn(e){if(!o()){X(e);return}if(r()){await tn();return}X(e)}function rn(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function X(e){let t=q()?.querySelector(`#tables-list`);if(!t)return;G=e;let n=!r();if(e.length===0){t.innerHTML=`<p class="tables-empty">No tables configured yet.</p>`,r()?o()&&Qt():J(Yt);return}r()&&o()&&Qt(),t.innerHTML=`
        <table class="tables-list">
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Max Pax</th>
                    <th scope="col">Actions</th>
                </tr>
            </thead>
            <tbody>${e.map(e=>{let t=e.pax_max==null?`—`:String(e.pax_max),r=n?` disabled`:``;return`
            <tr data-id="${e.id}">
                <td>${rn(pt(e))}</td>
                <td>${rn(t)}</td>
                <td class="tables-actions">
                    <button type="button" class="tables-edit-btn" data-id="${e.id}"${r}>Edit</button>
                    <button type="button" class="tables-delete-btn" data-id="${e.id}"${r}>Delete</button>
                </td>
            </tr>
        `}).join(``)}</tbody>
        </table>
    `,n&&o()&&J(Jt)}function an(e){W=e.id;let t=q()?.querySelector(`#table-name`),n=q()?.querySelector(`#table-pax-max`),r=q()?.querySelector(`#table-form-heading`),i=q()?.querySelector(`#table-save-btn`),a=q()?.querySelector(`#table-cancel-btn`);t&&(t.value=e.name),n&&(n.value=e.pax_max==null?``:String(e.pax_max)),r&&(r.textContent=`Edit Table`),i&&(i.textContent=`Update Table`),a&&(a.hidden=!1),t?.focus()}async function on(){if(!U)return;if(H&&=(await H.close(),null),Zt(),!o()){$t();return}Y();let e=l();H=U.query({sql:`SELECT id, name, pax_max FROM tables
                  WHERE restaurant_id = ?
                  ORDER BY name`,parameters:[e]}).watch(),H.registerListener({onData:e=>{nn(e)}})}async function sn(e){U=e.db,Kt=new AbortController;let{signal:t}=Kt;G=[],K=0,q()?.querySelector(`#tables-list`)?.addEventListener(`click`,async e=>{let t=e.target;if(!(t instanceof HTMLElement)||!U||!o()||!r())return;let n=l(),i=t.closest(`.tables-edit-btn`),a=t.closest(`.tables-delete-btn`);if(i){let e=parseInt(i.getAttribute(`data-id`)??``,10),t=G.find(t=>t.id===e);t&&an(t);return}if(a){let e=parseInt(a.getAttribute(`data-id`)??``,10);if(Number.isNaN(e))return;try{let t=mt(await _t(U,e,n));if(!window.confirm(t))return;await yt(U,e,n),W===e&&Zt(),await tn()}catch(e){J(e.message??`Could not delete table.`)}}},{signal:t}),q()?.querySelector(`#table-cancel-btn`)?.addEventListener(`click`,()=>{Zt(),Y()},{signal:t}),q()?.querySelector(`#table-form`)?.addEventListener(`submit`,async e=>{if(e.preventDefault(),!U||!o())return;if(!r()){J(Jt);return}let t=l(),n=q()?.querySelector(`#table-name`),i=q()?.querySelector(`#table-pax-max`),a=n?.value.trim()??``,s=en(i?.value??``);if(!a){J(`Table name is required.`);return}try{W==null?(await ht({restaurant_id:t,name:a,pax_max:s}),q()?.querySelector(`#table-form`)?.reset(),await tn()):(await gt(W,{name:a,pax_max:s},t),Zt(),await tn()),Qt(),Y()}catch(e){J(e.message??`Could not save table.`)}},{signal:t}),window.addEventListener(`online`,()=>{Y(),G.length>0&&X(G)},{signal:t}),window.addEventListener(`offline`,()=>{Y(),G.length>0&&X(G)},{signal:t}),qt=e.registerOnAccountSwitch(()=>{on()}),await on()}async function cn(){qt?.(),qt=null,H&&=(await H.close(),null),Kt?.abort(),Kt=null,U=null,W=null,G=[],K=0}var ln=null,un=null,Z=null,Q=()=>document.getElementById(`view-sync-status`);function dn(e){return e?new Date(e).toLocaleString():`—`}function fn(e){return e==null?``:e<1024?`${e} B`:`${(e/1024).toFixed(1)} kB`}function pn(e){return e===`offline`?`Offline`:e===`warning`?`Attention needed`:`Up to date`}function $(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function mn(e){let t=Q()?.querySelector(`#sync-status-summary`);if(!t)return;let n=e.online?e.connected?`Connected`:e.connecting?`Connecting…`:`Disconnected`:`Offline`;t.innerHTML=`
        <div class="sync-status-metric sync-status-metric--${e.health}">
            <span class="sync-status-metric-label">Status</span>
            <span class="sync-status-metric-value">${pn(e.health)}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Connection</span>
            <span class="sync-status-metric-value">${n}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Last synced</span>
            <span class="sync-status-metric-value">${dn(e.lastSyncedAt)}</span>
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
    `,e.statusMessage&&t.insertAdjacentHTML(`beforeend`,`<p class="sync-status-message">${$(e.statusMessage)}</p>`)}function hn(e){let t=[e.opData?.first_name,e.opData?.last_name].filter(Boolean).join(` `),n=e.opData?.datetime??``,r=e.opData?.status??``;return`
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
    `}function gn(e){let t=Q()?.querySelector(`#sync-status-uploads-list`);if(t){if(e.pendingUploads.length===0){t.innerHTML=`<p class="sync-status-empty">No pending uploads${e.uploadQueueSize==null?``:` (${fn(e.uploadQueueSize)})`}</p>`;return}t.innerHTML=(e.uploadQueueSize==null?``:`<p class="sync-status-queue-size">Queue size: ${fn(e.uploadQueueSize)}</p>`)+e.pendingUploads.map(hn).join(``)}}function _n(e){let t=Q()?.querySelector(`#sync-status-downloads-list`);if(!t)return;let n=[],r=e.dataFlowStatus??{};if(r.downloading&&e.downloadProgress){let t=Math.round(e.downloadProgress.downloadedFraction*100);n.push(`
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
                <p class="sync-status-item-meta">Last synced: ${dn(e.lastSyncedAt)}</p>
                ${e.bookingCount==null?``:`<p class="sync-status-item-meta">${e.bookingCount} booking(s) stored locally</p>`}
            </article>
        `);let i=m();if(i.length>0){n.push(`<h3 class="sync-status-activity-heading">Recent download activity</h3>`);for(let e of i)n.push(`
                <article class="sync-status-item">
                    <p class="sync-status-item-detail">${dn(e.at)}</p>
                    <p class="sync-status-item-meta">${e.operations==null?`Download completed`:`${e.operations} operations received`}</p>
                </article>
            `)}r.uploading&&n.unshift(`<p class="sync-status-active-label">Uploading changes…</p>`),t.innerHTML=n.length?n.join(``):`<p class="sync-status-empty">No download activity</p>`}function vn(e){let t=Q()?.querySelector(`#sync-status-issues-list`);if(!t)return;let n=[],r=e.dataFlowStatus??{};r.downloadError&&n.push(`
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
        `);let i=p();for(let e of i)n.push(`
            <article class="sync-status-issue sync-status-issue--${e.type.includes(`discarded`)?`error`:`warning`}">
                <p class="sync-status-issue-type">${$(e.type.replace(/_/g,` `))}</p>
                <p class="sync-status-issue-message">${$(e.message)}</p>
                <p class="sync-status-issue-meta">${dn(e.at)}</p>
            </article>
        `);t.innerHTML=n.length?n.join(``):`<p class="sync-status-empty">No issues detected</p>`}function yn(e){mn(e),gn(e),_n(e),vn(e)}function bn(e,t){!e||!Z||(e.disabled=!1,navigator.onLine?t&&Z.connected?e.textContent=`Reconnect`:e.textContent=`Failed to connect`:e.textContent=`Offline`)}async function xn(e){Z=e.db,ln=new AbortController;let{signal:t}=ln,n=Q()?.querySelector(`#sync-status-reconnect-btn`);n?.addEventListener(`click`,async()=>{if(!n||!Z)return;n.disabled=!0,n.textContent=`Reconnecting...`;let e=null;try{e=await v(Z)}finally{bn(n,e)}},{signal:t}),window.addEventListener(`online`,()=>{n?.textContent===`Offline`&&(n.textContent=`Reconnect`)},{signal:t}),un=f(yn)}async function Sn(){un?.(),un=null,ln?.abort(),ln=null,Z=null}var{name:Cn}=Ae(),wn=null,Tn=Me({...await De({initialRoute:Cn,onNavigate:(e,t)=>wn?.(e,t)}),views:{manager:{mount:lt,unmount:ut},create:{mount:jt,unmount:Mt},walkin:{mount:Pt,unmount:Ft},metrics:{mount:Wt,unmount:Gt},tables:{mount:sn,unmount:cn},"sync-status":{mount:xn,unmount:Sn}}});wn=Tn.navigate,await Tn.start();