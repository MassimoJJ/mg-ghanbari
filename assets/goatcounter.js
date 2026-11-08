/**
 * GoatCounter analytics — free, privacy-friendly, no cookies.
 *
 * Set GC_CODE to the site code you choose when you sign up at
 * https://www.goatcounter.com  (your dashboard is then
 * https://<GC_CODE>.goatcounter.com).
 *
 * Until a real code is set this loader does nothing, so it is safe to ship.
 * To activate: set GC_CODE below (or tell me the code and I'll set it).
 */
(function () {
    var GC_CODE = "REPLACE_WITH_YOUR_GOATCOUNTER_CODE";
    if (!GC_CODE || GC_CODE === "REPLACE_WITH_YOUR_GOATCOUNTER_CODE") return;

    // Documented dynamic-load method: point the endpoint, then load count.js.
    window.goatcounter = { endpoint: "https://" + GC_CODE + ".goatcounter.com/count" };

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    document.head.appendChild(s);
})();
