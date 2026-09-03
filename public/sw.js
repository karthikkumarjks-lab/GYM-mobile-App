// Minimal service worker — just enough to make the app installable.
// Network-first; no offline caching yet (the app needs the network for Supabase anyway).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
