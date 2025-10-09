// src/hooks/useNotifications.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ensureNotificationReady,
  getExpoPushToken,
  scheduleLocalNotification,
  sendExpoServerPush,
  subscribeNotificationEvents,
  isSimulator,
} from "../services/notifications";

export function useNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const simulator = isSimulator();

  useEffect(() => {
    (async () => {
      try {
        await ensureNotificationReady();
        setReady(true);
        const t = await getExpoPushToken(); // null on Simulator
        setToken(t);
      } catch (e) {
        setReady(false);
        console.warn("Notifications not ready:", e);
      }
    })();

    const unsub = subscribeNotificationEvents({
      onReceived: (n) => {
        // foreground received
        console.log("Received:", n.request.content);
      },
      onResponse: (resp) => {
        // user tapped
        const data = resp.notification.request.content.data as any;
        console.log("Tapped with data:", data);
        // e.g., navigate based on data.screen
      },
    });
    return () => unsub();
  }, []);

  const sendTest = useCallback(
    async (title = "Hello from server", body = "Testing Expo push") => {
      if (simulator || !token) {
        // Fallback on Simulator (or if token unavailable)
        await scheduleLocalNotification(
          { title: "Local fallback", body: "Scheduled because push is unavailable" },
          3
        );
        return { fallback: true };
      }
      const res = await sendExpoServerPush(token, {
        title,
        body,
        data: { screen: "Home" },
      });
      return { fallback: false, res };
    },
    [token, simulator]
  );

  return useMemo(
    () => ({ ready, token, simulator, sendTest }),
    [ready, token, simulator, sendTest]
  );
}
