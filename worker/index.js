/* global clients */

const isSafeInternalUrl = (value) => {
  if (typeof value !== "string" || !value.startsWith("/")) return false;
  return !value.startsWith("//") && !value.includes("\\");
};

const parsePayload = (event) => {
  if (!event.data) return null;
  try {
    const payload = event.data.json();
    if (
      !payload ||
      typeof payload.eventId !== "string" ||
      typeof payload.title !== "string" ||
      typeof payload.body !== "string" ||
      !isSafeInternalUrl(payload.url)
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      const payload = parsePayload(event);
      if (!payload) return;
      const windowClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const adminClients = windowClients.filter((client) =>
        new URL(client.url).pathname.startsWith("/admin"),
      );
      const visibleClient = adminClients.find(
        (client) => client.visibilityState === "visible",
      );
      for (const client of adminClients) {
        client.postMessage({ type: "ADMIN_PUSH_RECEIVED", payload });
      }
      if (visibleClient) return;
      await self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: payload.eventId,
        renotify: false,
        data: {
          url: payload.url,
          notificationId: payload.notificationId,
          orderId: payload.orderId,
        },
      });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const target = event.notification.data?.url;
      if (!isSafeInternalUrl(target)) return;
      const windowClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of windowClients) {
        if (!new URL(client.url).pathname.startsWith("/admin")) continue;
        if ("focus" in client && "navigate" in client) {
          await client.focus();
          await client.navigate(new URL(target, self.location.origin).href);
          return;
        }
      }
      await clients.openWindow(new URL(target, self.location.origin).href);
    })(),
  );
});
