(function () {
    try {
        if (localStorage.getItem('landing-theme') === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    } catch (_) {}
})();
