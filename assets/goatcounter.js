/**
 * GoatCounter analytics — free, privacy-friendly, no cookies.
 *
 * GC_CODE is the site code chosen at https://www.goatcounter.com
 * (your dashboard is then https://<GC_CODE>.goatcounter.com).
 *
 * It is set to "massimojavier" (the code registered on GoatCounter). Once the
 * signup email is verified, tracking goes live automatically. To use a different
 * code, change the value below (or ask and I'll change it).
 */
(function () {
    var GC_CODE = "mgghanbari";
    if (!GC_CODE || GC_CODE === "REPLACE_WITH_YOUR_GOATCOUNTER_CODE") return;

    // Documented dynamic-load method: point the endpoint, then load count.js.
    window.goatcounter = { endpoint: "https://" + GC_CODE + ".goatcounter.com/count" };

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    document.head.appendChild(s);
})();
