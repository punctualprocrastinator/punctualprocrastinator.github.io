/* app.js - two small jobs: the light/dark toggle, and assembling the
   email address so it is not sitting in the HTML for scrapers.
   No dependencies, no build step. Loaded with `defer` on every page. */

(function () {
    'use strict';

    /* ---------------------------------------------------------------
       Theme. The stylesheet already follows the system preference;
       this only records a deliberate override. Storage can throw in
       private windows, so every access is guarded.
       --------------------------------------------------------------- */

    var STORE_KEY = 'theme';

    function readStored() {
        try {
            return localStorage.getItem(STORE_KEY);
        } catch (e) {
            return null;
        }
    }

    function writeStored(value) {
        try {
            localStorage.setItem(STORE_KEY, value);
        } catch (e) {
            /* nothing to do - the toggle still works for this page view */
        }
    }

    function systemPrefersDark() {
        return window.matchMedia &&
               window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function activeTheme() {
        var set = document.documentElement.getAttribute('data-theme');
        if (set) { return set; }
        return systemPrefersDark() ? 'dark' : 'light';
    }

    function label() {
        var button = document.getElementById('theme-toggle');
        if (!button) { return; }
        var dark = activeTheme() === 'dark';
        // The label names what you get by pressing it, not the current state.
        button.textContent = dark ? 'Light' : 'Dark';
        button.setAttribute('aria-label',
            'Switch to ' + (dark ? 'light' : 'dark') + ' theme');
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        label();
    }

    // The head snippet has already applied any stored override; this just
    // sets the button text to match whatever is on screen.
    label();

    // Follow the system if the visitor has never pressed the toggle.
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', function () {
                if (!readStored()) { label(); }
            });
    }

    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
        toggle.addEventListener('click', function () {
            var next = activeTheme() === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            writeStored(next);
        });
    }

    /* ---------------------------------------------------------------
       Email. The address lives in data- attributes and is joined here,
       which stops the simplest harvesters without hiding it from a
       person. Anyone with JS off sees the fallback text in the HTML.
       --------------------------------------------------------------- */

    var link = document.getElementById('email-link');
    if (link) {
        var user = link.getAttribute('data-user');
        var domain = link.getAttribute('data-domain');
        if (user && domain) {
            var address = user + '@' + domain;
            link.href = 'mailto:' + address;
            link.textContent = address;
        }
    }
}());
