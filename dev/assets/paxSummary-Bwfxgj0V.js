function e(e){let{total_pax:t,adult_pax:n,child_pax:r,hc_pax:i}=e;return`
        <span class="booking-summary-pax-total">${t}</span>
        <span class="booking-summary-pax-breakdown">
            <span>${n}A</span>
            <span>${r}C</span>
            <span>${i}HC</span>
        </span>
    `}function t(t){return`<span class="booking-summary-pax">${e(t)}</span>`}function n(t){return`<div class="metrics-pax-cell">${e(t)}</div>`}function r({dayTotal:e,lunch:t,dinner:n}){return`
        <span class="booking-summary-pax-total">${e.booking_count}-${e.total_pax}</span>
        <span class="booking-summary-pax-breakdown">
            <span>L${t.booking_count}-${t.total_pax}</span>
            <span>D${n.booking_count}-${n.total_pax}</span>
        </span>
    `}function i(e){return`<span class="booking-summary-pax">${r(e)}</span>`}export{t as i,n,e as r,i as t};