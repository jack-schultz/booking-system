const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/supabaseClient-jAmk_zrl.js","assets/supabaseClient-Cll7b3zd.js","assets/preload-helper-j_ZwnIYB.js"])))=>i.map(i=>d[i]);
import"./style-CEPcSWMK.js";import{t as e}from"./preload-helper-j_ZwnIYB.js";import"./register-CxERNST-.js";import{g as t,h as n,i as r,n as i,t as a,u as o,y as s}from"./syncStatus-CUus1Ppg.js";import{i as c,n as l,t as u}from"./footer-NbQLN31a.js";import{n as d,r as f,t as ee}from"./accountSwitcher-LE1U5bbM.js";import{i as te}from"./sync-D3d_CMNe.js";import{n as ne,t as p}from"./db-DZsXyThn.js";import{S as re,_ as ie,a as m,b as ae,c as oe,d as se,f as ce,g as le,h as ue,i as de,l as fe,m as pe,n as me,o as he,p as ge,r as _e,s as ve,t as ye,u as be,v as h,y as xe}from"./bookings-C83OnqHb.js";var Se=[{name:`manager`,label:`BOOKINGS`,className:`booking-sidebar-nav-link--bookings`},{name:`create`,label:`NEW BOOKING`,className:`booking-sidebar-nav-link--new-booking`},{name:`walkin`,label:`WALK-IN`,className:`booking-sidebar-nav-link--walk-in`}];function Ce(e,{activeRoute:t,onNavigate:n,showSaveButton:r=!1}={}){if(!e)return;let i=r?`<button type="submit" form="bookingForm" class="booking-sidebar-nav-link booking-sidebar-nav-link--save">SAVE BOOKING</button>`:``;e.innerHTML=Se.map(({name:e,label:n,className:r})=>{let i=t===e;return`<button type="button" class="booking-sidebar-nav-link ${r}${i?` is-active`:``}" data-route="${e}"${i?` aria-current="page"`:``}>${n}</button>`}).join(``)+i,e.querySelectorAll(`[data-route]`).forEach(e=>{e.addEventListener(`click`,()=>{let r=e.getAttribute(`data-route`);r&&r!==t&&n?.(r)})})}function we(e,t={}){let n=document.createElement(`nav`);n.className=`booking-sidebar-nav`,e.replaceWith(n),Ce(n,t)}function Te(e={}){Ce(document.querySelector(`.booking-sidebar-nav`),e)}var Ee=new Set,De=new Set([`manager`,`create`,`walkin`]);function Oe(e){for(let t of Ee)t(e)}function ke(e){let t=document.getElementById(`booking-shell-layout`),n=document.getElementById(`booking-sidebar-panel`),r=De.has(e);t?.classList.toggle(`booking-page-layout--no-sidebar`,!r),n&&(n.hidden=!r)}async function Ae({initialRoute:e,onNavigate:t}){l(document.getElementById(`site-navbar-mount`),{basePath:`../`,activeRoute:e,onNavigate:t}),u(document.getElementById(`site-footer-mount`),{basePath:`../`}),we(document.getElementById(`booking-sidebar-mount`),{activeRoute:e,onNavigate:t,showSaveButton:e===`create`}),ke(e);let n=f({requireAuth:!0,loginRedirect:`../login.html`,onSwitch:e=>Oe(e)}),r=await ne();return await n,p(r),{db:r,registerOnAccountSwitch(e){return Ee.add(e),()=>Ee.delete(e)},setActiveRoute(e){ke(e),c({activeRoute:e,onNavigate:t,basePath:`../`}),De.has(e)&&Te({activeRoute:e,onNavigate:t,showSaveButton:e===`create`})}}}var je={manager:`manager`,create:`create`,walkin:`walkin`,metrics:`metrics`,tables:`tables`,"sync-status":`sync-status`},Me=/\/booking\/(manager|create|walkin|metrics|tables|sync-status)\/?$/;function g(e=window.location){let t=e.pathname.replace(/\/$/,``),n=new URLSearchParams(e.search).get(`edit`),r=t.match(Me)?.[1]??`manager`;return{name:r,editId:r===`create`?n:null}}function Ne(e,{edit:t}={}){let n=je[e]??je.manager,r=new URL(`/booking-system/dev/booking/${n}`,window.location.origin);return t?r.searchParams.set(`edit`,t):r.searchParams.delete(`edit`),`${r.pathname}${r.search}`}function Pe(e){let{db:t,registerOnAccountSwitch:n,setActiveRoute:r,views:i}=e,a=null,o={},s=!1,c={manager:document.getElementById(`view-manager`),create:document.getElementById(`view-create`),walkin:document.getElementById(`view-walkin`),metrics:document.getElementById(`view-metrics`),tables:document.getElementById(`view-tables`),"sync-status":document.getElementById(`view-sync-status`)};function l(e){for(let[t,n]of Object.entries(c))n&&(n.hidden=t!==e)}async function u(e,a={}){let o=i[e];if(!o)throw Error(`Unknown route: ${e}`);l(e),r(e),await o.mount({db:t,registerOnAccountSwitch:n,onNavigate:f,...a})}async function d(){if(!a)return;let e=i[a];e?.unmount&&await e.unmount()}async function f(e,{edit:t,replace:n=!1}={}){if(!s&&!(a===e&&(e!==`create`||(t??null)===o.editId))){s=!0;try{let r=Ne(e,{edit:t});n?history.replaceState({route:e,editId:t??null},``,r):history.pushState({route:e,editId:t??null},``,r),await d(),a=e,o={editId:t??null},await u(e,{editId:t??null})}finally{s=!1}}}async function ee(){let{name:e,editId:t}=g();a=e,o={editId:t},l(e),r(e),await u(e,{editId:t}),window.addEventListener(`popstate`,async e=>{if(!s){s=!0;try{let t=e.state,n=t?.route??g().name,i=t?.editId??g().editId;await d(),a=n,o={editId:i},l(n),r(n),await u(n,{editId:i})}finally{s=!1}}})}return{start:ee,navigate:f}}function _(e){let{total_pax:t,adult_pax:n,child_pax:r,hc_pax:i}=e;return`
        <span class="booking-summary-pax-total">${t}</span>
        <span class="booking-summary-pax-breakdown">
            <span>${n}A</span>
            <span>${r}C</span>
            <span>${i}HC</span>
        </span>
    `}function Fe(e){return`<span class="booking-summary-pax">${_(e)}</span>`}function v(e){return`<div class="metrics-pax-cell">${_(e)}</div>`}function Ie({dayTotal:e,lunch:t,dinner:n}){return`
        <span class="booking-summary-pax-total">${e.booking_count}-${e.total_pax}</span>
        <span class="booking-summary-pax-breakdown">
            <span>L${t.booking_count}-${t.total_pax}</span>
            <span>D${n.booking_count}-${n.total_pax}</span>
        </span>
    `}function Le(e){return`<span class="booking-summary-pax">${Ie(e)}</span>`}var Re=12,y=null,b=null,ze=null,x=new Set,S=null,Be=null,C=null,w=()=>document.getElementById(`view-manager`);function T(){let e=new Date;return e.setHours(0,0,0,0),e}function Ve(e){let t=new Date(e);return t.setHours(0,0,0,0),t}function He(e,t){let n=new Date(e);return n.setDate(n.getDate()+t),n}function E(e){let t=Ve(e);return t.setDate(1),t}function Ue(e,t){let n=E(e);return n.setMonth(n.getMonth()+t),n}function We(e){let t=E(e),n=[],r=new Date(t);for(;r.getMonth()===t.getMonth();)n.push(new Date(r)),r.setDate(r.getDate()+1);return n}function Ge(){let e=T(),t=[];for(let n=-1;n<=Re;n+=1)t.push(Ue(e,n));return t}function Ke(e){return{start:E(e[0]),end:Ue(E(e[e.length-1]),1)}}function D(e){let t=Ve(e);return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,`0`)}-${String(t.getDate()).padStart(2,`0`)}`}function qe(e){let t=Ve(e);return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,`0`)}`}function Je(e){if(!/^\d{4}-\d{2}-\d{2}$/.test(e))return null;let t=new Date(`${e}T00:00:00`);return Number.isNaN(t.getTime())?null:t}function Ye(e,t){return D(e)===D(t)}function Xe(){return Je(localStorage.getItem(s.MANAGER_SELECTED_DATE))??T()}function Ze(e){localStorage.setItem(s.MANAGER_SELECTED_DATE,D(e))}function Qe(e){return e.toLocaleDateString(`en-AU`,{weekday:`short`,day:`numeric`})}function $e(e){return e.toLocaleDateString(`en-AU`,{month:`short`,year:`numeric`})}function et(e){let t=new Date(e);t.setHours(0,0,0,0);let n=new Date(t);return n.setDate(n.getDate()+1),{start:t,end:n}}function O(){let e=w()?.querySelector(`#booking-date-dropdown`),t=w()?.querySelector(`#booking-date-picker`);e&&(e.hidden=!0),t?.setAttribute(`aria-expanded`,`false`)}function tt(){let e=w()?.querySelector(`#booking-date-today`);e&&(e.disabled=Ye(C,T()))}function nt(e,t){let n=new Map;for(let e of t)for(let t of We(e))n.set(D(t),he());for(let t of e){let e=ge(t.datetime),r=n.get(e);r&&ye(r,t)}return n}async function rt(e){let{start:t,end:n}=Ke(e);return S.getAll(`SELECT * FROM bookings
         WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
         ORDER BY datetime`,[d(),h(t),h(n)])}function it(){return new Set([qe(T())])}function at(e,{dayTotal:t,lunch:n,dinner:r},{selectedKey:i,today:a}){let o=D(e),s=document.createElement(`button`);return s.type=`button`,s.className=`booking-date-option`,s.role=`option`,s.innerHTML=`
        <span class="booking-date-option-label">${Qe(e)}</span>
        <span class="booking-date-option-pax">${Le({dayTotal:t,lunch:n,dinner:r})}</span>
    `,o===i?(s.classList.add(`is-selected`),s.setAttribute(`aria-selected`,`true`)):s.setAttribute(`aria-selected`,`false`),Ye(e,a)&&s.classList.add(`is-today`),s.addEventListener(`click`,t=>{t.stopPropagation(),ut(e)}),s}function ot(e,t,{selectedKey:n,today:r}){let i=qe(e),a=x.has(i),o=document.createElement(`div`);o.className=`booking-date-month-group`,a&&o.classList.add(`is-expanded`);let s=document.createElement(`button`);s.type=`button`,s.className=`booking-date-month-toggle`,s.dataset.monthKey=i,s.setAttribute(`aria-expanded`,String(a)),s.innerHTML=`
        <span class="booking-month-separator-label">${$e(e)}</span>
        <span class="booking-date-month-chevron" aria-hidden="true"></span>
    `;let c=document.createElement(`div`);c.className=`booking-date-month-days`,c.hidden=!a;for(let i of We(e)){let e=D(i),{dayTotal:a,lunch:o,dinner:s}=t.get(e)??he();c.appendChild(at(i,{dayTotal:a,lunch:o,dinner:s},{selectedKey:n,today:r}))}return s.addEventListener(`click`,e=>{e.stopPropagation();let t=s.getAttribute(`aria-expanded`)!==`true`;s.setAttribute(`aria-expanded`,String(t)),c.hidden=!t,o.classList.toggle(`is-expanded`,t),t?x.add(i):x.delete(i)}),o.append(s,c),o}async function st(){let e=w();if(!e)return;let t=e.querySelector(`#booking-date-dropdown-list`),n=T(),r=D(C),i=Ge(),a=new Map;a=o()?nt(await rt(i),i):nt([],i),t.innerHTML=``;for(let e of i)t.appendChild(ot(e,a,{selectedKey:r,today:n}))}async function ct(){let e=w();if(!e)return;x=it(),await st();let t=e.querySelector(`#booking-date-dropdown`),n=e.querySelector(`#booking-date-picker`),r=e.querySelector(`#booking-date-dropdown-list`);t.hidden=!1,n.setAttribute(`aria-expanded`,`true`),r.querySelector(`.booking-date-option.is-selected`)?.scrollIntoView({block:`nearest`})}async function lt(){let e=w();e&&(e.querySelector(`#booking-date-dropdown`).hidden?await ct():O())}function ut(e){C=Ve(e),Ze(C),tt(),O(),vt()}function dt(){ut(T())}function ft(e){let t=new Map;for(let n of e){let e=ue(n.datetime),r=t.get(e)??ve();me(r,n),t.set(e,r)}return t}function pt(e,t,n,r){let i=`timeslot-group-${e}`,a=document.getElementById(i);if(!a){a=document.createElement(`section`),a.id=i,a.className=`booking-timeslot-group`;let e=document.createElement(`div`);e.className=`booking-timeslot-heading`,e.innerHTML=`
        <div class="booking-summary-primary">
            <span class="booking-timeslot-time">${fe(t)}</span>
            <span class="booking-summary-pax">${_(n)}</span>
        </div>`;let o=document.createElement(`div`);o.className=`booking-timeslot-items`,a.append(e,o),r.appendChild(a)}return a.querySelector(`.booking-timeslot-items`)}async function mt(e,t){let n=pe(t);await ae(S,e,d(),n)}function ht(e,t){let n=w();if(!n)return;let r=n.querySelector(`#booking-list-header`),i=n.querySelector(`#booking-header-pax`);r.textContent=e.toLocaleDateString(`en-AU`,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`});let{dayTotal:a,lunch:o,dinner:s}=_e(t);i.innerHTML=Le({dayTotal:a,lunch:o,dinner:s}),i.hidden=!1}function gt(e,t){let n=w();if(!n)return;let r=n.querySelector(`#booking-list`);if(ht(t,e),e.length===0){r.innerHTML=`<p>No bookings for today. (or they are still downloading)</p>`;return}r.innerHTML=``;let i=ft(e);e.forEach(e=>{let t=ue(e.datetime),n=pt(t,e.datetime,i.get(t),r),a=``;e.preference!==`none`&&(a=`<div class="booking-detail-preference">${e.preference.charAt(0).toUpperCase()+e.preference.slice(1)}</div>`);let o=se(e.status),s=ce(e.status),c=`<button type="button" class="booking-detail-status ${o}" data-id="${e.id}">${s}</button>`,l=document.createElement(`div`);l.className=`booking-list-item-card`,l.innerHTML=`
            <div class="booking-summary-primary">
                <div class="booking-detail-time-preference">
                    <span class="booking-summary-name">${e.first_name} ${e.last_name}</span>
                    ${a}
                </div>
                <span class="booking-summary-time">${fe(e.datetime)}</span>
                <span class="booking-summary-pax">
                    ${_(e)}
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
        `,l.addEventListener(`click`,()=>{l.querySelector(`.booking-list-item-details`).classList.toggle(`is-expanded`)}),l.querySelector(`.booking-detail-status`).addEventListener(`click`,async t=>{t.stopPropagation(),await mt(t.currentTarget.getAttribute(`data-id`),e.status)}),l.querySelector(`.booking-action-delete`).addEventListener(`click`,async t=>{t.stopPropagation(),confirm(`Are you sure you want to delete this booking?`)&&await oe(S,e.id,d())}),l.querySelector(`.booking-action-edit`).addEventListener(`click`,e=>{e.stopPropagation();let t=e.target.getAttribute(`data-id`);Be?.(`create`,{edit:t})}),n.appendChild(l)});let{dayTotal:a,lunch:o,dinner:s}=_e(e),c=document.createElement(`section`);c.className=`booking-timeslot-group booking-day-total`,c.innerHTML=`
        <div class="booking-timeslot-heading">
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Lunch Total Pax</span>
                ${Fe(o)}
            </div>
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Dinner Total Pax</span>
                ${Fe(s)}
            </div>
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Total Pax</span>
                ${Fe(a)}
            </div>
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Total Bookings</span>
                ${e.length}
            </div>
        </div>
    `,r.appendChild(c)}function _t(){let e=w();if(!e)return;let t=e.querySelector(`#booking-notice`),n=e.querySelector(`#booking-list`),r=e.querySelector(`#booking-header-pax`);t.hidden=!1,t.textContent=`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.`,n.innerHTML=``,e.querySelector(`#booking-list-header`).textContent=`Bookings unavailable`,r.hidden=!0,r.innerHTML=``}async function vt(){if(b&&=(await b.close(),null),!o()){_t();return}let e=w();if(!e)return;let t=e.querySelector(`#booking-notice`);t.hidden=!0;let n=C,{start:r,end:i}=et(n),a=d();b=S.query({sql:`SELECT * FROM bookings
                  WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
                  ORDER BY datetime, last_name`,parameters:[a,h(r),h(i)]}).watch(),b.registerListener({onData:e=>gt(e,n)})}async function yt(e){S=e.db,Be=e.onNavigate,C=Xe(),y=new AbortController;let{signal:t}=y,n=w();if(!n)return;let r=n.querySelector(`#booking-date-picker`),i=n.querySelector(`#booking-date-dropdown`),a=n.querySelector(`#booking-date-today`);tt(),r.addEventListener(`click`,e=>{e.stopPropagation(),lt()},{signal:t}),r.addEventListener(`keydown`,e=>{e.key===`Enter`||e.key===` `?(e.preventDefault(),lt()):e.key===`Escape`&&O()},{signal:t}),i.addEventListener(`click`,e=>{e.stopPropagation()},{signal:t}),a.addEventListener(`click`,e=>{e.stopPropagation(),dt()},{signal:t}),document.addEventListener(`click`,()=>{O()},{signal:t}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&O()},{signal:t}),n.querySelector(`#booking-list-date-left`).addEventListener(`click`,()=>{ut(He(C,-1))},{signal:t}),n.querySelector(`#booking-list-date-right`).addEventListener(`click`,()=>{ut(He(C,1))},{signal:t}),ze=e.registerOnAccountSwitch(()=>{vt()}),await vt()}async function bt(){b&&=(await b.close(),null),y?.abort(),y=null,ze?.(),ze=null,O(),S=null,Be=null}async function xt(e,t){return e.getAll(`SELECT id, name, pax_max FROM tables
         WHERE restaurant_id = ?
         ORDER BY name`,[t])}async function St(t){let{supabase:n}=await e(async()=>{let{supabase:e}=await import(`./supabaseClient-jAmk_zrl.js`);return{supabase:e}},__vite__mapDeps([0,1,2])),{data:r,error:i}=await n.from(`tables`).select(`id, name, pax_max`).eq(`restaurant_id`,t).order(`name`);if(i)throw i;return r??[]}function Ct(e){return e.pax_max==null?e.name:`${e.name} (${e.pax_max} max)`}function wt(e){return e<=0?`Delete this table?`:`This table is assigned to ${e} ${e===1?`booking`:`bookings`}. Deleting it will set those bookings to None. Continue?`}async function Tt(t){if(!n())throw Error(`Adding tables requires an internet connection.`);let{supabase:r}=await e(async()=>{let{supabase:e}=await import(`./supabaseClient-jAmk_zrl.js`);return{supabase:e}},__vite__mapDeps([0,1,2])),{error:i}=await r.from(`tables`).insert({restaurant_id:t.restaurant_id,name:t.name,pax_max:t.pax_max});if(i)throw i}async function Et(t,r,i){if(!n())throw Error(`Updating tables requires an internet connection.`);let{supabase:a}=await e(async()=>{let{supabase:e}=await import(`./supabaseClient-jAmk_zrl.js`);return{supabase:e}},__vite__mapDeps([0,1,2])),{error:o}=await a.from(`tables`).update({name:r.name,pax_max:r.pax_max}).eq(`id`,t).eq(`restaurant_id`,i);if(o)throw o}async function Dt(e,t,n){return(await e.get(`SELECT COUNT(*) AS count FROM bookings
         WHERE table_id = ? AND restaurant_id = ?`,[t,n]))?.count??0}async function Ot(e,t,n){await e.execute(`UPDATE bookings SET table_id = NULL
         WHERE table_id = ? AND restaurant_id = ?`,[t,n])}async function kt(t,r,i){if(await Ot(t,r,i),!n())throw Error(`Deleting tables requires an internet connection.`);let{supabase:a}=await e(async()=>{let{supabase:e}=await import(`./supabaseClient-jAmk_zrl.js`);return{supabase:e}},__vite__mapDeps([0,1,2])),{error:o}=await a.from(`tables`).delete().eq(`id`,r).eq(`restaurant_id`,i);if(o)throw o}function At(e,t){let n=e.querySelector(`option[value=""]`);if(e.innerHTML=``,n)e.appendChild(n);else{let t=document.createElement(`option`);t.value=``,t.selected=!0,t.textContent=`None`,e.appendChild(t)}for(let n of t){let t=document.createElement(`option`);t.value=String(n.id),t.textContent=Ct(n),e.appendChild(t)}}async function jt(e,t){let r=await xt(e,t);return r.length>0||!n()?r:St(t)}var k=null,Mt=null,A=null,j=null,M=()=>document.getElementById(`view-create`);function Nt(){let e=M();if(!e)return;let t=e.querySelector(`#bookingForm`);t.reset();let n=e.querySelector(`#pageTitle`),r=e.querySelector(`#create-booking-notice`),i=e.querySelector(`#timeslot`),a=e.querySelector(`#bookingDate`);n.textContent=`New Booking`,r.hidden=!0,r.textContent=``,re(i),a.value=ge(Date());let o=e.querySelector(`#tableId`);o&&(o.value=``),t.querySelectorAll(`input, select, textarea, button`).forEach(e=>{e.disabled=!1})}function Pt(){let e=M();if(!e)return!1;let t=e.querySelector(`#bookingForm`),n=e.querySelector(`#create-booking-notice`);return o()?(n.hidden=!0,t.querySelectorAll(`input, select, textarea, button`).forEach(e=>{e.disabled=!1}),!0):(n.hidden=!1,n.textContent=`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant before creating bookings.`,t.querySelectorAll(`input, select, textarea, button`).forEach(e=>{e.disabled=!0}),!1)}async function Ft(){let e=M();if(!e||!A)return;let t=e.querySelector(`#tableId`);if(!t)return;if(!o()){At(t,[]);return}let n=d();At(t,await jt(A,n))}async function It(e,t){let n=M();if(!n)return;let r=n.querySelector(`#pageTitle`),i=n.querySelector(`#bookingDate`),a=n.querySelector(`#timeslot`),o=n.querySelector(`#firstName`),s=n.querySelector(`#lastName`),c=n.querySelector(`#phoneNumber`),l=n.querySelector(`#email`),u=n.querySelector(`#totalPax`),f=n.querySelector(`#adultPax`),ee=n.querySelector(`#childPax`),te=n.querySelector(`#hcPax`),ne=n.querySelector(`#preference`),p=n.querySelector(`#tableId`),re=n.querySelector(`#additionalDetails`);r.textContent=`Loading booking…`;let ie=d(),m=await be(A,e,ie);if(!m){j?.(`manager`,{replace:!0});return}t.editingId=e,t.editingStatus=m.status,r.textContent=`Edit Booking`,i.value=ge(m.datetime),a.value=ue(m.datetime),o.value=m.first_name,s.value=m.last_name,c.value=m.phone_number??``,l.value=m.email??``,u.value=m.total_pax,f.value=m.adult_pax,ee.value=m.child_pax,te.value=m.hc_pax,ne.value=m.preference??`none`,p&&(p.value=m.table_id==null?``:String(m.table_id)),re.value=m.notes??``}function Lt(e){let t=e.querySelector(`#totalPax`),n=e.querySelector(`#childPax`),r=e.querySelector(`#hcPax`),i=e.querySelector(`#adultPax`),a=parseInt(t.value,10)||0,o=parseInt(n.value,10)||0,s=parseInt(r.value,10)||0,c=a-o-s;c<0&&(c=0),i.value=c}async function Rt(e){A=e.db,j=e.onNavigate,k=new AbortController;let{signal:n}=k,r=M();if(!r)return;let i=r.querySelector(`#bookingForm`);r.querySelector(`#timeslot`);let a=r.querySelector(`#totalPax`),s=r.querySelector(`#childPax`),c=r.querySelector(`#hcPax`),l={editingId:null,editingStatus:t.PENDING};Nt();let u=()=>Lt(r);a.addEventListener(`change`,u,{signal:n}),s.addEventListener(`change`,u,{signal:n}),c.addEventListener(`change`,u,{signal:n}),Mt=e.registerOnAccountSwitch(()=>{Pt(),Ft()}),window.addEventListener(`online`,()=>{o()&&Ft()},{signal:n}),Pt()&&(await Ft(),e.editId&&await It(e.editId,l)),i.addEventListener(`submit`,async e=>{if(e.preventDefault(),!o())return;let n=r.querySelector(`#bookingDate`),i=r.querySelector(`#timeslot`),a=r.querySelector(`#firstName`),s=r.querySelector(`#lastName`),c=r.querySelector(`#phoneNumber`),u=r.querySelector(`#email`),f=r.querySelector(`#totalPax`),te=r.querySelector(`#adultPax`),ne=r.querySelector(`#childPax`),p=r.querySelector(`#hcPax`),re=r.querySelector(`#preference`),ae=r.querySelector(`#tableId`),oe=r.querySelector(`#additionalDetails`),se=ae?.value??``,ce=se===``?null:parseInt(se,10),le={first_name:a.value,last_name:s.value,phone_number:c.value,email:u.value,total_pax:parseInt(f.value,10),adult_pax:parseInt(te.value,10),child_pax:parseInt(ne.value,10),hc_pax:parseInt(p.value,10),preference:re.value,notes:oe.value,datetime:m(n.value,i.value),status:l.editingId?l.editingStatus:t.PENDING,table_id:ce};l.editingId?await xe(A,l.editingId,le,d()):await ie(A,{...le,profile_id:ee(),restaurant_id:d(),id:crypto.randomUUID(),created_at:h(new Date)}),j?.(`manager`)},{signal:n})}async function zt(){k?.abort(),k=null,Mt?.(),Mt=null,A=null,j=null}var Bt=null;async function Vt(e){Bt=new AbortController}async function Ht(){Bt?.abort(),Bt=null}var N=null,P=null,Ut=null,F=null,I=0,L=()=>document.getElementById(`view-metrics`);function Wt(e,t){let n=new Date(t);return n.setDate(n.getDate()-1),`${e.toLocaleDateString(`en-AU`,{weekday:`short`,day:`numeric`,month:`short`})} - ${n.toLocaleDateString(`en-AU`,{weekday:`short`,day:`numeric`,month:`short`,year:`numeric`})}`}function Gt(e,t){return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}function Kt(e,t,n){let r=L()?.querySelector(`#metrics-header`),i=L()?.querySelector(`#metrics-table`);if(!r||!i)return;r.textContent=Wt(t,n);let{days:a,lunchTotal:o,dinnerTotal:s,weekendTotal:c,weekTotal:l}=de(e,t),u=new Date;u.setHours(0,0,0,0),i.innerHTML=`
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
            <tr class="${Gt(e.date,u)?`metrics-row--today`:``}">
                <th scope="row">${e.date.toLocaleDateString(`en-AU`,{weekday:`long`,day:`numeric`,month:`short`})}</th>
                <td>${v(e.lunch)}</td>
                <td>${v(e.dinner)}</td>
                <td>${v(e.dayTotal)}</td>
            </tr>
        `).join(``)}
            </tbody>
            <tfoot>
                <tr class="metrics-row--summary">
                    <th scope="row">Week total</th>
                    <td>${v(o)}</td>
                    <td>${v(s)}</td>
                    <td>${v(l)}</td>
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
                    <td>${v(c)}</td>
                </tr>
                <tr class="metrics-row--summary">
                    <th scope="row">Week total</th>
                    <td>${v(l)}</td>
                </tr>
            </tbody>
        </table>
    `}function qt(){let e=L()?.querySelector(`#metrics-notice`),t=L()?.querySelector(`#metrics-table`),n=L()?.querySelector(`#metrics-header`);!e||!t||!n||(e.hidden=!1,e.textContent=`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.`,t.innerHTML=``,n.textContent=`Metrics unavailable`)}async function Jt(){if(!F)return;P&&=(await P.close(),null);let e=L()?.querySelector(`#metrics-notice`);if(!o()){qt();return}e&&(e.hidden=!0);let{start:t,end:n}=le(new Date,I),r=d();P=F.query({sql:`SELECT * FROM bookings
                  WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
                  ORDER BY datetime`,parameters:[r,h(t),h(n)]}).watch(),P.registerListener({onData:e=>Kt(e,t,n)})}async function Yt(e){F=e.db,N=new AbortController;let{signal:t}=N;I=0,L()?.querySelector(`#metrics-week-left`)?.addEventListener(`click`,()=>{--I,Jt()},{signal:t}),L()?.querySelector(`#metrics-week-right`)?.addEventListener(`click`,()=>{I+=1,Jt()},{signal:t}),Ut=e.registerOnAccountSwitch(()=>{Jt()}),await Jt()}async function Xt(){Ut?.(),Ut=null,P&&=(await P.close(),null),N?.abort(),N=null,F=null,I=0}var Zt=null,R=null,Qt=null,z=null,B=null,V=[],H=0,$t=`Table changes require an internet connection. You can still view synced tables and assign them to bookings offline.`,en=`No tables synced yet. Connect online once to download tables for offline use.`,U=()=>document.getElementById(`view-tables`);function tn(e){U()?.querySelector(`#table-form`)?.querySelectorAll(`input, button`).forEach(t=>{t.disabled=e})}function W(){B=null;let e=U()?.querySelector(`#table-form`),t=U()?.querySelector(`#table-form-heading`),n=U()?.querySelector(`#table-save-btn`),r=U()?.querySelector(`#table-cancel-btn`);e?.reset(),t&&(t.textContent=`Add Table`),n&&(n.textContent=`Save Table`),r&&(r.hidden=!0)}function G(e){let t=U()?.querySelector(`#tables-notice`);t&&(t.hidden=!1,t.textContent=e)}function K(){let e=U()?.querySelector(`#tables-notice`);e&&(e.hidden=!0,e.textContent=``)}function nn(){G(`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.`);let e=U()?.querySelector(`#tables-list`);e&&(e.innerHTML=``),V=[],tn(!0)}function q(){if(!o())return;let e=!n();if(tn(e),e){G($t);return}K()}function rn(e){let t=e.trim();if(t===``)return null;let n=parseInt(t,10);return Number.isNaN(n)?null:n}async function J(){if(!z||!o()||!n())return;let e=++H,t=d();try{let n=await St(t);if(e!==H)return;Y(n)}catch{e===H&&Y(V)}}async function an(e){if(!o()){Y(e);return}if(n()){await J();return}Y(e)}function on(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function Y(e){let t=U()?.querySelector(`#tables-list`);if(!t)return;V=e;let r=!n();if(e.length===0){t.innerHTML=`<p class="tables-empty">No tables configured yet.</p>`,n()?o()&&K():G(en);return}n()&&o()&&K(),t.innerHTML=`
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
                <td>${on(Ct(e))}</td>
                <td>${on(t)}</td>
                <td class="tables-actions">
                    <button type="button" class="tables-edit-btn" data-id="${e.id}"${n}>Edit</button>
                    <button type="button" class="tables-delete-btn" data-id="${e.id}"${n}>Delete</button>
                </td>
            </tr>
        `}).join(``)}</tbody>
        </table>
    `,r&&o()&&G($t)}function sn(e){B=e.id;let t=U()?.querySelector(`#table-name`),n=U()?.querySelector(`#table-pax-max`),r=U()?.querySelector(`#table-form-heading`),i=U()?.querySelector(`#table-save-btn`),a=U()?.querySelector(`#table-cancel-btn`);t&&(t.value=e.name),n&&(n.value=e.pax_max==null?``:String(e.pax_max)),r&&(r.textContent=`Edit Table`),i&&(i.textContent=`Update Table`),a&&(a.hidden=!1),t?.focus()}async function cn(){if(!z)return;if(R&&=(await R.close(),null),W(),!o()){nn();return}q();let e=d();R=z.query({sql:`SELECT id, name, pax_max FROM tables
                  WHERE restaurant_id = ?
                  ORDER BY name`,parameters:[e]}).watch(),R.registerListener({onData:e=>{an(e)}})}async function ln(e){z=e.db,Zt=new AbortController;let{signal:t}=Zt;V=[],H=0,U()?.querySelector(`#tables-list`)?.addEventListener(`click`,async e=>{let t=e.target;if(!(t instanceof HTMLElement)||!z||!o()||!n())return;let r=d(),i=t.closest(`.tables-edit-btn`),a=t.closest(`.tables-delete-btn`);if(i){let e=parseInt(i.getAttribute(`data-id`)??``,10),t=V.find(t=>t.id===e);t&&sn(t);return}if(a){let e=parseInt(a.getAttribute(`data-id`)??``,10);if(Number.isNaN(e))return;try{let t=wt(await Dt(z,e,r));if(!window.confirm(t))return;await kt(z,e,r),B===e&&W(),await J()}catch(e){G(e.message??`Could not delete table.`)}}},{signal:t}),U()?.querySelector(`#table-cancel-btn`)?.addEventListener(`click`,()=>{W(),q()},{signal:t}),U()?.querySelector(`#table-form`)?.addEventListener(`submit`,async e=>{if(e.preventDefault(),!z||!o())return;if(!n()){G($t);return}let t=d(),r=U()?.querySelector(`#table-name`),i=U()?.querySelector(`#table-pax-max`),a=r?.value.trim()??``,s=rn(i?.value??``);if(!a){G(`Table name is required.`);return}try{B==null?(await Tt({restaurant_id:t,name:a,pax_max:s}),U()?.querySelector(`#table-form`)?.reset(),await J()):(await Et(B,{name:a,pax_max:s},t),W(),await J()),K(),q()}catch(e){G(e.message??`Could not save table.`)}},{signal:t}),window.addEventListener(`online`,()=>{q(),V.length>0&&Y(V)},{signal:t}),window.addEventListener(`offline`,()=>{q(),V.length>0&&Y(V)},{signal:t}),Qt=e.registerOnAccountSwitch(()=>{cn()}),await cn()}async function un(){Qt?.(),Qt=null,R&&=(await R.close(),null),Zt?.abort(),Zt=null,z=null,B=null,V=[],H=0}var X=null,dn=null,Z=null,Q=()=>document.getElementById(`view-sync-status`);function fn(e){return e?new Date(e).toLocaleString():`—`}function pn(e){return e==null?``:e<1024?`${e} B`:`${(e/1024).toFixed(1)} kB`}function mn(e){return e===`offline`?`Offline`:e===`warning`?`Attention needed`:`Up to date`}function $(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function hn(e){let t=Q()?.querySelector(`#sync-status-summary`);if(!t)return;let n=e.online?e.connected?`Connected`:e.connecting?`Connecting…`:`Disconnected`:`Offline`;t.innerHTML=`
        <div class="sync-status-metric sync-status-metric--${e.health}">
            <span class="sync-status-metric-label">Status</span>
            <span class="sync-status-metric-value">${mn(e.health)}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Connection</span>
            <span class="sync-status-metric-value">${n}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Last synced</span>
            <span class="sync-status-metric-value">${fn(e.lastSyncedAt)}</span>
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
    `,e.statusMessage&&t.insertAdjacentHTML(`beforeend`,`<p class="sync-status-message">${$(e.statusMessage)}</p>`)}function gn(e){let t=[e.opData?.first_name,e.opData?.last_name].filter(Boolean).join(` `),n=e.opData?.datetime??``,r=e.opData?.status??``;return`
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
    `}function _n(e){let t=Q()?.querySelector(`#sync-status-uploads-list`);if(t){if(e.pendingUploads.length===0){t.innerHTML=`<p class="sync-status-empty">No pending uploads${e.uploadQueueSize==null?``:` (${pn(e.uploadQueueSize)})`}</p>`;return}t.innerHTML=(e.uploadQueueSize==null?``:`<p class="sync-status-queue-size">Queue size: ${pn(e.uploadQueueSize)}</p>`)+e.pendingUploads.map(gn).join(``)}}function vn(e){let t=Q()?.querySelector(`#sync-status-downloads-list`);if(!t)return;let n=[],r=e.dataFlowStatus??{};if(r.downloading&&e.downloadProgress){let t=Math.round(e.downloadProgress.downloadedFraction*100);n.push(`
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
                <p class="sync-status-item-meta">Last synced: ${fn(e.lastSyncedAt)}</p>
                ${e.bookingCount==null?``:`<p class="sync-status-item-meta">${e.bookingCount} booking(s) stored locally</p>`}
            </article>
        `);let i=a();if(i.length>0){n.push(`<h3 class="sync-status-activity-heading">Recent download activity</h3>`);for(let e of i)n.push(`
                <article class="sync-status-item">
                    <p class="sync-status-item-detail">${fn(e.at)}</p>
                    <p class="sync-status-item-meta">${e.operations==null?`Download completed`:`${e.operations} operations received`}</p>
                </article>
            `)}r.uploading&&n.unshift(`<p class="sync-status-active-label">Uploading changes…</p>`),t.innerHTML=n.length?n.join(``):`<p class="sync-status-empty">No download activity</p>`}function yn(e){let t=Q()?.querySelector(`#sync-status-issues-list`);if(!t)return;let n=[],r=e.dataFlowStatus??{};r.downloadError&&n.push(`
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
                <p class="sync-status-issue-meta">${fn(e.at)}</p>
            </article>
        `);t.innerHTML=n.length?n.join(``):`<p class="sync-status-empty">No issues detected</p>`}function bn(e){hn(e),_n(e),vn(e),yn(e)}function xn(e,t){!e||!Z||(e.disabled=!1,navigator.onLine?t&&Z.connected?e.textContent=`Reconnect`:e.textContent=`Failed to connect`:e.textContent=`Offline`)}async function Sn(e){Z=e.db,X=new AbortController;let{signal:t}=X,n=Q()?.querySelector(`#sync-status-reconnect-btn`);n?.addEventListener(`click`,async()=>{if(!n||!Z)return;n.disabled=!0,n.textContent=`Reconnecting...`;let e=null;try{e=await te(Z)}finally{xn(n,e)}},{signal:t}),window.addEventListener(`online`,()=>{n?.textContent===`Offline`&&(n.textContent=`Reconnect`)},{signal:t}),dn=r(bn)}async function Cn(){dn?.(),dn=null,X?.abort(),X=null,Z=null}var{name:wn}=g(),Tn=null,En=Pe({...await Ae({initialRoute:wn,onNavigate:(e,t)=>Tn?.(e,t)}),views:{manager:{mount:yt,unmount:bt},create:{mount:Rt,unmount:zt},walkin:{mount:Vt,unmount:Ht},metrics:{mount:Yt,unmount:Xt},tables:{mount:ln,unmount:un},"sync-status":{mount:Sn,unmount:Cn}}});Tn=En.navigate,await En.start();