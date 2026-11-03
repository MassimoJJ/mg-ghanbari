/**
 * Visit counter — one hit per browsing session.
 *
 * Deliberately tiny and dependency-free: two GETs to a public counter service,
 * no cookies, no identifiers, nothing personal leaves the page. If the service
 * is unreachable the requests fail silently and the site is unaffected.
 *
 * To change provider (e.g. to GoatCounter later), only this file changes.
 */
(function () {
    var SERVICE = 'https://abacus.jasoncameron.dev';
    var NAMESPACE = 'mgghanbari-portfolio';

    // One hit per session, so browsing ten pages still counts as one visit.
    try {
        if (sessionStorage.getItem('vc-hit')) return;
        sessionStorage.setItem('vc-hit', '1');
    } catch (e) {
        // Storage blocked (private mode): count anyway rather than not at all.
    }

    var day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD, UTC

    function hit(key) {
        try {
            fetch(SERVICE + '/hit/' + NAMESPACE + '/' + key, { mode: 'cors', cache: 'no-store' });
        } catch (e) { /* offline, blocked, service down — ignore */ }
    }

    hit('visits');
    hit('d-' + day);
})();
