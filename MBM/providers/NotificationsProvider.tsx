import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { PropsWithChildren, useEffect } from "react";
import { subscribeToPendingArrivalAlerts as subscribeArrivals } from "../services/arrivalAlertService";
import { subscribeToPendingArrivalAlerts as subscribeEmergencies } from "../services/emergencyService";
import { scheduleLocalNotification, subscribeNotificationEvents } from "../services/notifications";

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
  const router = useRouter();
  useEffect(() => {
    const unsub = subscribeNotificationEvents({
      onReceived: (n) => console.log("Received:", n.request.content),
      onResponse: (r) => {
        try {
          const data = r.notification.request.content.data as any;
          const title = r.notification.request.content.title ?? "";
          if (data?.screen === "adminNotifications") {
            const open = data?.source ?? data?.open ?? "arrival";
            router.push(`/adminNotifications?open=${encodeURIComponent(open)}`);
            return;
          }
          if (/Emergencia/i.test(title)) {
            router.push("/adminNotifications?open=emergency");
            return;
          }
          if (/Nueva llegada|Ha llegado/i.test(title)) {
            router.push("/adminNotifications?open=arrival");
            return;
          }
        } catch (e) {
          console.warn("Error handling notification response:", e);
        }
      },
    });

    const unsubEmergencies = subscribeEmergencies((change) => {
      try {
        if (change.eventType === "INSERT" && change.new && change.new.received === false) {
          const title = "Emergencia";
          const body = change.new.localizationID
            ? `Ubicación: ${change.new.localizationID}`
            : `Alerta recibida: ${change.new.timeAlert ?? ""}`;
          scheduleLocalNotification({ title, body, data: { screen: "adminNotifications", source: "emergency", id: change.new?.id } }, 1).catch((e) => console.warn(e));
        }
      } catch (e) {
        console.warn("Error handling emergency change:", e);
      }
    });

    const unsubArrivals = subscribeArrivals((change) => {
      try {
        if (change.eventType === "INSERT" && change.new && change.new.accepted === false) {
          const title = "Ha llegado un Medico";
          const body = `${change.new.name} — ${change.new.arrivalTime}`;
          scheduleLocalNotification({ title, body, data: { screen: "adminNotifications", source: "arrival", id: change.new?.id } }, 1).catch((e) => console.warn(e));
        }
      } catch (e) {
        console.warn("Error handling arrival change:", e);
      }
    });

    return () => {
      try {
        unsub();
      } finally {
        try {
          unsubEmergencies();
        } catch (e) {}
        try {
          unsubArrivals();
        } catch (e) {}
      }
    };
  }, []);

  return <>{children}</>;
}
