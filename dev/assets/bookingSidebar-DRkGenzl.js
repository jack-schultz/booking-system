function e(e,{showSaveButton:t=!1}={}){e.outerHTML=`
        <nav class="booking-sidebar-nav">
            <a class="booking-sidebar-nav-link booking-sidebar-nav-link--bookings" href="manager.html">BOOKINGS</a>
            <a class="booking-sidebar-nav-link booking-sidebar-nav-link--new-booking" href="create.html">NEW BOOKING</a>
            <a class="booking-sidebar-nav-link booking-sidebar-nav-link--walk-in" href="walkin-create.html">WALK-IN</a>
            ${t?`<button type="submit" form="bookingForm" class="booking-sidebar-nav-link booking-sidebar-nav-link--save">SAVE BOOKING</button>`:``}
        </nav>
    `}export{e as t};