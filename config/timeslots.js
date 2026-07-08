import { getTimeslotFromDatetime } from '../db/bookings.js';

/** Timeslot at or after which a booking counts as dinner (5:00 PM). */
export const DINNER_CUTOFF_TIMESLOT = '1700';

/** Classify a booking datetime as lunch (before 5pm) or dinner (5pm onwards). */
export function getMealPeriodFromDatetime(datetime) {
    const timeslot = getTimeslotFromDatetime(datetime);
    return timeslot >= DINNER_CUTOFF_TIMESLOT ? 'dinner' : 'lunch';
}

/** 24-hour compact timeslot value, e.g. "0900" = 9:00 AM */
function formatTimeslotValue(hours, minutes) {
    return `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}`;
}

/** Human-readable label, e.g. "9:00am" */
function formatTimeslotLabel(hours, minutes) {
    let displayHours = hours;
    const ampm = displayHours >= 12 ? 'pm' : 'am';
    if (displayHours > 12) displayHours -= 12;
    if (displayHours === 0) displayHours = 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')}${ampm}`;
}

/** Bookable timeslots from 9:00 AM through 11:00 PM, every 15 minutes */
export const TIMESLOT_OPTIONS = (() => {
    const options = [];
    for (let totalMinutes = 9 * 60; totalMinutes <= 23 * 60; totalMinutes += 15) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        options.push({
            value: formatTimeslotValue(hours, minutes),
            label: formatTimeslotLabel(hours, minutes),
        });
    }
    return options;
})();

/** Populate a <select> element with standard timeslot options */
export function populateTimeslotSelect(selectElement) {
    const placeholder = selectElement.querySelector('option[value=""]');
    selectElement.innerHTML = '';
    if (placeholder) {
        selectElement.appendChild(placeholder);
    } else {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.textContent = 'Select Timeslot';
        selectElement.appendChild(defaultOption);
    }

    for (const { value, label } of TIMESLOT_OPTIONS) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        selectElement.appendChild(option);
    }
}
