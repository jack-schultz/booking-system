export function formatPaxBreakdown(totals) {
    const { total_pax, adult_pax, child_pax, hc_pax } = totals;

    return `
        <span class="booking-summary-pax-total">${total_pax}</span>
        <span class="booking-summary-pax-breakdown">
            <span>${adult_pax}A</span>
            <span>${child_pax}C</span>
            <span>${hc_pax}HC</span>
        </span>
    `;
}

export function formatPaxSummary(totals) {
    return `<span class="booking-summary-pax">${formatPaxBreakdown(totals)}</span>`;
}

export function formatMetricsPaxCell(totals) {
    return `<div class="metrics-pax-cell">${formatPaxBreakdown(totals)}</div>`;
}
