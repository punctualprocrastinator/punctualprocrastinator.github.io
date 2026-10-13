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
       Botanical art. Writes scroll progress (0 at the top, 1 at the end)
       to --sp; the stylesheet turns that into the dandelion seeds blowing
       away, petals falling and steam rising. Only transform and opacity change, so the browser
       composites it without repainting. Skipped entirely for anyone who
       has asked their system for reduced motion.
       --------------------------------------------------------------- */

    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduceMotion) {
        var root = document.documentElement;
        var pending = false;

        function updateScroll() {
            var room = root.scrollHeight - window.innerHeight;
            var p = room > 0 ? window.scrollY / room : 0;
            root.style.setProperty('--sp', Math.min(1, Math.max(0, p)).toFixed(4));
            pending = false;
        }

        window.addEventListener('scroll', function () {
            if (!pending) {
                pending = true;
                window.requestAnimationFrame(updateScroll);
            }
        }, { passive: true });
        window.addEventListener('resize', updateScroll);
        updateScroll();
    }

    /* ---------------------------------------------------------------
       The filter bar under the bio. Papers carry a data-cat; pressing a
       button shows only that tag. Everything is in the HTML, so with JS
       off the visitor simply sees all of them.
       --------------------------------------------------------------- */

    var filterbar = document.querySelector('.filterbar');
    if (filterbar) {
        var buttons = Array.prototype.slice.call(filterbar.querySelectorAll('button'));
        var papers = Array.prototype.slice.call(document.querySelectorAll('#papers .pub'));
        var empty = document.getElementById('no-papers');

        function applyFilter(tag) {
            var shown = 0;
            papers.forEach(function (p) {
                var on = tag === 'all' || p.getAttribute('data-cat') === tag;
                p.hidden = !on;
                if (on) { shown += 1; }
            });
            buttons.forEach(function (b) {
                b.setAttribute('aria-pressed',
                    b.getAttribute('data-filter') === tag ? 'true' : 'false');
            });
            if (empty) { empty.hidden = shown !== 0; }
        }

        buttons.forEach(function (b) {
            b.addEventListener('click', function () {
                var tag = b.getAttribute('data-filter');
                applyFilter(tag);
                history.replaceState(null, '', tag === 'all' ? '#papers' : '#' + tag);
            });
        });

        // A link like index.html#tabular opens on that tag.
        var wanted = window.location.hash.slice(1);
        if (wanted && buttons.some(function (b) { return b.getAttribute('data-filter') === wanted; })) {
            applyFilter(wanted);
        }
    }

    /* ---------------------------------------------------------------
       Paper dialogs. Each index entry has a button and a <dialog>; the
       button is hidden until this runs, so with JS off the page still
       works and the titles still link to the full entry.
       --------------------------------------------------------------- */

    document.documentElement.classList.add('js');

    document.querySelectorAll('.more[data-dialog]').forEach(function (button) {
        var dialog = document.getElementById(button.getAttribute('data-dialog'));
        if (!dialog || typeof dialog.showModal !== 'function') {
            button.hidden = true;        // very old browser: leave the links
            return;
        }

        button.addEventListener('click', function () { dialog.showModal(); });

        var close = dialog.querySelector('.close');
        if (close) {
            close.addEventListener('click', function () { dialog.close(); });
        }

        // Clicking the backdrop closes it. The dialog element covers the
        // whole viewport, so compare against the inner box.
        dialog.addEventListener('click', function (e) {
            if (e.target !== dialog) { return; }
            var box = dialog.getBoundingClientRect();
            var outside = e.clientX < box.left || e.clientX > box.right ||
                          e.clientY < box.top  || e.clientY > box.bottom;
            if (outside) { dialog.close(); }
        });
    });

    /* ---------------------------------------------------------------
       Link notes. A link's title becomes a small bubble on hover and on
       keyboard focus. The title moves to data-tip so the browser's own
       slower tooltip does not appear on top of it.
       --------------------------------------------------------------- */

    var tipLinks = document.querySelectorAll('a[title]');
    if (tipLinks.length) {
        var tip = document.createElement('div');
        tip.className = 'tip';
        tip.id = 'link-tip';
        tip.setAttribute('role', 'tooltip');
        document.body.appendChild(tip);

        function placeTip(el) {
            var r = el.getBoundingClientRect();
            var tw = tip.offsetWidth, th = tip.offsetHeight;
            var left = Math.min(Math.max(8, r.left), window.innerWidth - tw - 8);
            var top = r.bottom + 8;
            if (top + th > window.innerHeight - 8) { top = r.top - th - 8; }
            tip.style.left = left + 'px';
            tip.style.top = top + 'px';
        }
        function showTip(el) {
            tip.textContent = el.getAttribute('data-tip');
            el.setAttribute('aria-describedby', 'link-tip');
            placeTip(el);
            tip.classList.add('on');
        }
        function hideTip(el) {
            tip.classList.remove('on');
            if (el) { el.removeAttribute('aria-describedby'); }
        }

        Array.prototype.forEach.call(tipLinks, function (el) {
            el.setAttribute('data-tip', el.getAttribute('title'));
            el.removeAttribute('title');
            el.addEventListener('mouseenter', function () { showTip(el); });
            el.addEventListener('mouseleave', function () { hideTip(el); });
            el.addEventListener('focus', function () { showTip(el); });
            el.addEventListener('blur', function () { hideTip(el); });
        });
        window.addEventListener('scroll', function () { hideTip(null); }, { passive: true });
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
