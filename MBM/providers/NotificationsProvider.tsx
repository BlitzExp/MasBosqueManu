import React, { PropsWithChildren, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { subscribeNotificationEvents } from "../services/notifications";

// Foreground behavior lives here, not in App.tsx
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function NotificationsProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const unsub = subscribeNotificationEvents({
      onReceived: (n) => console.log("Received:", n.request.content),
      onResponse: (r) =>
        console.log("Tapped with data:", r.notification.request.content.data),
    });
    return () => unsub();
  }, []);

  return <>{children}</>;
}
