/**
 * GoatCounter analytics — free, privacy-friendly, no cookies.
 *
 * GC_CODE is the site code chosen at https://www.goatcounter.com
 * (your dashboard is then https://<GC_CODE>.goatcounter.com).
 *
 * It is set to "mgghanbari" (the registered GoatCounter site code). The
 * account is massimojavier@gmail.com, which is NOT the site code. To use a
 * different code, change GC_CODE below.
 */
(function () {
    var GC_CODE = "mgghanbari";
    if (!GC_CODE || GC_CODE === "REPLACE_WITH_YOUR_GOATCOUNTER_CODE") return;

    // Documented dynamic-load method: point the endpoint, then load count.js.
    window.goatcounter = { endpoint: "https://" + GC_CODE + ".goatcounter.com/count" };

    // Vendored copy: gc.zgo.at is unreachable on some networks, which silently
    // kills tracking. Serving it from this origin keeps the tracker working.
    //
    // Resolve count.js against THIS LOADER's URL, never a literal "assets/...".
    // Pages live at /, /apps/, /ai/ and /notes/, so a page-relative path would
    // become /mg-ghanbari/apps/assets/... (404) and only the homepage would
    // ever be counted.
    var own = (document.currentScript && document.currentScript.src) || "";
    if (!own) {
        var tags = document.querySelectorAll("script[src]");
        for (var i = 0; i < tags.length; i++) {
            if (/goatcounter\.js(\?|$)/.test(tags[i].src)) { own = tags[i].src; break; }
        }
    }
    var base = own ? own.replace(/goatcounter\.js.*$/, "") : "";
    var s = document.createElement("script");
    s.async = true;
    s.src = base + "goatcounter-count.js";
    document.head.appendChild(s);
})();
