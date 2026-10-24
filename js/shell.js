/*
 * AIRH MAX - Comportamiento del shell.
 * - Bloquea el scroll cuando el menú móvil está abierto.
 * - Cierra el menú con Escape.
 * - Eleva la top bar al hacer scroll.
 * - Gestiona el foco del menú móvil.
 */
(function () {
    'use strict';

    var body = document.body;

    function setNavOpen(open) {
        var wasOpen = body.classList.contains('airh-nav-open');
        body.classList.toggle('airh-nav-open', !!open);

        if (open) {
            window.setTimeout(function () {
                var first = document.querySelector('.airh-sidebar .nav-item');
                if (first) {
                    first.focus({ preventScroll: true });
                }
            }, 60);
        } else if (wasOpen) {
            var toggle = document.querySelector('.hamburger');
            if (toggle && typeof toggle.focus === 'function') {
                toggle.focus({ preventScroll: true });
            }
        }
    }

    window.airhShell = {
        setNavOpen: setNavOpen,
        closeNav: function () {
            setNavOpen(false);
        }
    };

    // Escape cierra el menú móvil.
    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') {
            return;
        }

        var overlay = document.querySelector('.nav-overlay.show');
        if (overlay) {
            overlay.click();
        }
    });

    // Elevación de la top bar al hacer scroll.
    var lastScrolled = null;

    function syncTopbar() {
        var topbar = document.querySelector('.airh-topbar');
        if (!topbar) {
            return;
        }

        var scrolled = window.scrollY > 8;
        if (scrolled !== lastScrolled) {
            topbar.classList.toggle('scrolled', scrolled);
            lastScrolled = scrolled;
        }
    }

    window.addEventListener('scroll', syncTopbar, { passive: true });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncTopbar);
    } else {
        syncTopbar();
    }
})();
