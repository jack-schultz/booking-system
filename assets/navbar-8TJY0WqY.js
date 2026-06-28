import{createClient as e}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";var t=``,n=``;console.warn(`Using default Supabase project config. Copy .env.example to .env to override.`);var r=e(t,n);function i(e,{basePath:t=``,showAuthControls:n=!1}={}){e.outerHTML=`
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
    `}export{r as n,i as t};