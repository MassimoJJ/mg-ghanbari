/**
 * Visit counter — one hit per browsing session, plus one per page per session.
 *
 * Deliberately tiny and dependency-free: a few GETs to a public counter service,
 * no cookies, no identifiers, nothing personal leaves the page. If the service
 * is unreachable the requests fail silently and the site is unaffected.
 *
 * Data it records:
 *   visits        — total sessions
 *   d-YYYY-MM-DD  — sessions on a given day (UTC)
 *   p-<slug>      — sessions that included a given page (for the Top pages list)
 *
 * To change provider (e.g. to GoatCounter), only this file changes.
 */
(function () {
    var SERVICE = 'https://abacus.jasoncameron.dev';
    var NAMESPACE = 'mgghanbari-portfolio';

    function sGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
    function sSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

    function hit(key) {
        try {
            fetch(SERVICE + '/hit/' + NAMESPACE + '/' + key, { mode: 'cors', cache: 'no-store' });
        } catch (e) { /* offline, blocked, service down — ignore */ }
    }

    function slug() {
        var p = location.pathname;
        p = p.replace(/^\/mg-ghanbari\/?/, '/');     // strip GitHub Pages base
        p = p.replace(/\.html$/, '');
        p = p.replace(/\/index$/, '/');
        if (p === '/' || p === '') return 'home';
        return ('/' + p).replace(/\/+/g, '/')
                     .replace(/^\//, '')
                     .replace(/\/$/, '')
                     .replace(/\//g, '-') || 'home';
    }

    // Global session total — counted once per session.
    if (!sGet('vc-hit')) {
        sSet('vc-hit', '1');
        hit('visits');
        hit('d-' + new Date().toISOString().slice(0, 10));
    }

    // Per-page — counted once per session, per page.
    var pkey = 'p-' + slug();
    if (!sGet('vc-' + pkey)) {
        sSet('vc-' + pkey, '1');
        hit(pkey);
    }
})();
