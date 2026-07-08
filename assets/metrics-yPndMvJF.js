import{n as e,t}from"./footer-9jXkGN1J.js";import"./register-C68K_GfI.js";import{o as n}from"./accounts-Br4GLleJ.js";import{n as r,r as i}from"./accountSwitcher-oG_dRl8B.js";import{n as a,t as o}from"./db-CovA7E6O.js";import{d as s,p as c,t as l}from"./bookings-DZ1TBEMF.js";e(document.getElementById(`site-navbar-mount`),{basePath:`../`,showAuthControls:!0,showSyncIndicator:!0}),t(document.getElementById(`site-footer-mount`),{basePath:`../`});var u=document.getElementById(`metrics-header`),d=document.getElementById(`metrics-notice`),f=document.getElementById(`metrics-table`),p=i({requireAuth:!0,loginRedirect:`../login.html`,onSwitch:()=>S()}),m=await a(),h=0,g=null;document.getElementById(`metrics-week-left`).addEventListener(`click`,()=>{--h,S()}),document.getElementById(`metrics-week-right`).addEventListener(`click`,()=>{h+=1,S()});function _(e,t){let n=new Date(t);return n.setDate(n.getDate()-1),`${e.toLocaleDateString(`en-AU`,{weekday:`short`,day:`numeric`,month:`short`})} - ${n.toLocaleDateString(`en-AU`,{weekday:`short`,day:`numeric`,month:`short`,year:`numeric`})}`}function v(e){let{total_pax:t,adult_pax:n,child_pax:r,hc_pax:i}=e;return`
        <div class="metrics-pax-cell">
            <span class="booking-summary-pax-total">${t}</span>
            <span class="booking-summary-pax-breakdown">
                <span>${n}A</span>
                <span>${r}C</span>
                <span>${i}HC</span>
            </span>
        </div>
    `}function y(e,t){return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}function b(e,t,n){u.textContent=_(t,n);let{days:r,lunchTotal:i,dinnerTotal:a,weekendTotal:o,weekTotal:s}=l(e,t),c=new Date;c.setHours(0,0,0,0),f.innerHTML=`
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
                ${r.map(e=>`
            <tr class="${y(e.date,c)?`metrics-row--today`:``}">
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
                    <td>${v(i)}</td>
                    <td>${v(a)}</td>
                    <td>${v(s)}</td>
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
                    <td>${v(o)}</td>
                </tr>
                <tr class="metrics-row--summary">
                    <th scope="row">Week total</th>
                    <td>${v(s)}</td>
                </tr>
            </tbody>
        </table>
    `}function x(){d.hidden=!1,d.textContent=`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.`,f.innerHTML=``,u.textContent=`Metrics unavailable`}async function S(){if(g&&=(await g.close(),null),!n()){x();return}d.hidden=!0;let{start:e,end:t}=s(new Date,h),i=r();g=m.query({sql:`SELECT * FROM bookings
                  WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
                  ORDER BY datetime`,parameters:[i,c(e),c(t)]}).watch(),g.registerListener({onData:n=>b(n,e,t)})}await p,await S(),o(m);