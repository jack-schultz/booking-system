import"./style-TQHRvbNd.js";import"./register-CxERNST-.js";import{o as e}from"./accounts-Ba5wxbSs.js";import{n as t,r as n}from"./accountSwitcher-CGaxRSSb.js";import{n as r,t as i}from"./footer-ChAm13O1.js";import{n as a,t as o}from"./db-k0F-LcVR.js";import{g as s,i as c,v as l}from"./bookings-Deon4TkP.js";import{n as u}from"./paxSummary-Bwfxgj0V.js";r(document.getElementById(`site-navbar-mount`),{basePath:`../`,showAuthControls:!0,showSyncIndicator:!0}),i(document.getElementById(`site-footer-mount`),{basePath:`../`});var d=document.getElementById(`metrics-header`),f=document.getElementById(`metrics-notice`),p=document.getElementById(`metrics-table`),m=n({requireAuth:!0,loginRedirect:`../login.html`,onSwitch:()=>S()}),h=await a(),g=0,_=null;document.getElementById(`metrics-week-left`).addEventListener(`click`,()=>{--g,S()}),document.getElementById(`metrics-week-right`).addEventListener(`click`,()=>{g+=1,S()});function v(e,t){let n=new Date(t);return n.setDate(n.getDate()-1),`${e.toLocaleDateString(`en-AU`,{weekday:`short`,day:`numeric`,month:`short`})} - ${n.toLocaleDateString(`en-AU`,{weekday:`short`,day:`numeric`,month:`short`,year:`numeric`})}`}function y(e,t){return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}function b(e,t,n){d.textContent=v(t,n);let{days:r,lunchTotal:i,dinnerTotal:a,weekendTotal:o,weekTotal:s}=c(e,t),l=new Date;l.setHours(0,0,0,0),p.innerHTML=`
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
            <tr class="${y(e.date,l)?`metrics-row--today`:``}">
                <th scope="row">${e.date.toLocaleDateString(`en-AU`,{weekday:`long`,day:`numeric`,month:`short`})}</th>
                <td>${u(e.lunch)}</td>
                <td>${u(e.dinner)}</td>
                <td>${u(e.dayTotal)}</td>
            </tr>
        `).join(``)}
            </tbody>
            <tfoot>
                <tr class="metrics-row--summary">
                    <th scope="row">Week total</th>
                    <td>${u(i)}</td>
                    <td>${u(a)}</td>
                    <td>${u(s)}</td>
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
                    <td>${u(o)}</td>
                </tr>
                <tr class="metrics-row--summary">
                    <th scope="row">Week total</th>
                    <td>${u(s)}</td>
                </tr>
            </tbody>
        </table>
    `}function x(){f.hidden=!1,f.textContent=`Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.`,p.innerHTML=``,d.textContent=`Metrics unavailable`}async function S(){if(_&&=(await _.close(),null),!e()){x();return}f.hidden=!0;let{start:n,end:r}=s(new Date,g),i=t();_=h.query({sql:`SELECT * FROM bookings
                  WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
                  ORDER BY datetime`,parameters:[i,l(n),l(r)]}).watch(),_.registerListener({onData:e=>b(e,n,r)})}await m,await S(),o(h);