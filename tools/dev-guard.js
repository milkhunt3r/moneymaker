/* Empire of Coins © 2026 milkhunt3r. All rights reserved. */
// dev.html (separate game scripts, used for testing) only runs on this computer, never on the website.
if (!/^(file:|http:\/\/(localhost|127\.0\.0\.1)[:/])/.test(location.href)) { location.replace("/"); window.stop(); throw new Error("dev only"); }
