/* Taskme service worker: phone notifications only (road step 1).
   No fetch handler on purpose: nothing is cached, so a new web release is never held back. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let p = {};
  try { p = e.data ? e.data.json() : {}; } catch { p = { title: "Taskme", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(p.title || "Taskme", {
    body: p.body || "",
    tag: p.tag,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: p.url || "/" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/";
  const open = new URL(url, self.location.origin).searchParams.get("open");
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of list) {
      if (new URL(c.url).origin !== self.location.origin) continue;
      await c.focus();
      if (open) c.postMessage({ taskmeOpen: open });
      return;
    }
    await self.clients.openWindow(url);
  })());
});
