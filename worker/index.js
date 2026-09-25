/* global clients */

const isSafeInternalUrl = (value) => {
  if (typeof value !== "string" || !value.startsWith("/")) return false;
  return !value.startsWith("//") && !value.includes("\\");
};

const isValidUnreadCount = (value) =>
  Number.isInteger(value) && value >= 0;

const updateAppBadge = async (count) => {
  try {
    if (count > 0 && typeof self.registration.setAppBadge === "function") {
      await self.registration.setAppBadge(count);
      return;
    }
    if (count === 0 && typeof self.registration.clearAppBadge === "function") {
      await self.registration.clearAppBadge();
    }
  } catch {
    // Badging is optional and must never block push delivery.
  }
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
    if (
      payload.type !== "CUSTOMER_ORDER_STATUS" &&
      !isValidUnreadCount(payload.unreadCount)
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
      const isCustomerPayload = payload.type === "CUSTOMER_ORDER_STATUS";
      if (!isCustomerPayload) {
        await updateAppBadge(payload.unreadCount);
      }
      const windowClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const adminClients = windowClients.filter((client) =>
        new URL(client.url).pathname.startsWith("/admin"),
      );
      const customerClients = windowClients.filter(
        (client) => !new URL(client.url).pathname.startsWith("/admin"),
      );
      const visibleClient = adminClients.find(
        (client) => client.visibilityState === "visible",
      );
      const visibleCustomerClient = customerClients.find(
        (client) => client.visibilityState === "visible",
      );
      for (const client of isCustomerPayload ? [] : adminClients) {
        client.postMessage({ type: "ADMIN_PUSH_RECEIVED", payload });
      }
      for (const client of isCustomerPayload ? customerClients : []) {
        client.postMessage({ type: "CUSTOMER_PUSH_RECEIVED", payload });
      }
      if (
        (isCustomerPayload && visibleCustomerClient) ||
        (!isCustomerPayload && visibleClient)
      ) {
        return;
      }
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
        const isAdminTarget = target.startsWith("/admin");
        const isAdminClient = new URL(client.url).pathname.startsWith("/admin");
        if (isAdminClient !== isAdminTarget) continue;
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
