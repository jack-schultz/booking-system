function e(e,{basePath:t=``,showAuthControls:n=!1}={}){e.outerHTML=`
        <div class="site-navbar">
            <div class="site-navbar-links-primary">
                <a href="${t}login.html">Login</a>
                <a href="${t}index.html">Home</a>
                <a href="${t}booking/manager.html">Bookings</a>
            </div>
            <div class="site-navbar-links-user">
                ${n?`<a id="logged_in_user">Not Logged In</a>
            <a id="logoutBtn">Logout</a>`:``}
                <a href="https://github.com/jack-schultz/booking-system">GitHub</a>
            </div>
        </div>
    `}export{e as t};