import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { PropsWithChildren, useEffect } from "react";
import { subscribeToPendingArrivalAlerts as subscribeArrivals } from "../Controlador/arrivalAlert";
import { obtainEmergencyAlertName, subscribeToPendingEmergencies as subscribeEmergencies } from "../Controlador/emergencyAlert";
import { ensureAdmin } from "../services/authorization";
import { scheduleLocalNotification, subscribeNotificationEvents } from "../services/notifications";
import { registerRealtimeCleanup } from "../services/realtimeSubscriptions";
import { supabase } from "../services/supabase";

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
    let unsubNotif: (() => void) | undefined;
    let unsubEmergencies: (() => void) | undefined;

    let unsubArrivals: (() => void) | undefined;
    let authSub: any;
    let unregisterRealtimeRegistry: (() => void) | undefined;

    (async () => {
      const proceedToAdminSubscriptions = async () => {
        try {
          const isAdmin = await ensureAdmin();
          if (!isAdmin) {
            console.log("User is not admin — skipping emergency/arrival subscriptions");
            return;
          }

          unsubEmergencies = await subscribeEmergencies(async (change) => {
            try {
              console.log("Emergency change received:", change);
              if (change.eventType === "INSERT" && change.new && change.new.received === false) {
                const title = "Emergencia";
                let body = `Alerta recibida: ${change.new.timeAlert ?? ""}`;
                if (change.new.localizationID) {
                  try {
                    const name = await obtainEmergencyAlertName(change.new);
                    body = `Ubicación: ${name}`;
                  } catch (err) {
                    console.warn("Could not resolve emergency location name:", err);
                    body = `Ubicación: ${change.new.localizationID}`;
                  }
                }
                console.log("Scheduling local notification for emergency:", { title, body, id: change.new?.id });
                scheduleLocalNotification({ title, body, data: { screen: "adminNotifications", source: "emergency", id: change.new?.id } }, 1).catch((e) => console.warn(e));
              }
            } catch (e) {
              console.warn("Error handling emergency change:", e);
            }
          });
          console.log("Emergency subscription established (unsubEmergencies set)");

          unsubArrivals = await subscribeArrivals((change) => {
            try {
              console.log("Arrival change received:", change);
              if (change.eventType === "INSERT" && change.new && change.new.accepted === false) {
                const title = "Ha llegado un Medico";
                const body = `${change.new.name} — ${change.new.arrivalTime}`;
                console.log("Scheduling local notification for arrival:", { title, body, id: change.new?.id });
                scheduleLocalNotification({ title, body, data: { screen: "adminNotifications", source: "arrival", id: change.new?.id } }, 1).catch((e) => console.warn(e));
              }
            } catch (e) {
              console.warn("Error handling arrival change:", e);
            }
          });
          console.log("Arrival subscription established (unsubArrivals set)");
          console.log("Admin realtime subscriptions established (emergencies/arrivals)");
        } catch (e) {
          console.warn("Error setting up admin realtime subscriptions:", e);
        }
      };

      try {
        // register a registry cleanup so realtime subscriptions (emergencies/arrivals)
        // are also removed when the app-wide realtime cleanup runs
        unregisterRealtimeRegistry = registerRealtimeCleanup(() => {
          try {
            if (unsubEmergencies) unsubEmergencies();
          } catch (e) {}
          try {
            if (unsubArrivals) unsubArrivals();
          } catch (e) {}
        });

        unsubNotif = subscribeNotificationEvents({
          onReceived: (n) => console.log("Notification received event:", n.request.content),
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
        console.log("Notification event listeners registered (unsubNotif set)");
      } catch (e) {
        console.warn("Error setting up notification subscriptions:", e);
      }
      try {
        const sessionResp: any = await supabase.auth.getSession();
        const session = sessionResp?.data?.session;
        if (session?.user) {
          console.log("Auth session detected — proceeding to admin subscriptions");
          await proceedToAdminSubscriptions();
        } else {
          const { data } = supabase.auth.onAuthStateChange((event: string, sess: any) => {
            try {
              if (event === "SIGNED_OUT") {
                console.log("Auth state change: SIGNED_OUT — cleaning realtime subscriptions");
                try {
                  if (unsubEmergencies) unsubEmergencies();
                } catch (e) {}
                try {
                  if (unsubArrivals) unsubArrivals();
                } catch (e) {}
                return;
              }
              if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && sess?.user) {
                console.log("Auth state change: SIGNED_IN/TOKEN_REFRESHED — proceeding to admin subscriptions");
                proceedToAdminSubscriptions().catch((e) => console.warn(e));
              }
            } catch (e) {
              console.warn('Error in auth state change handler', e);
            }
          });
          authSub = data?.subscription;
        }
      } catch (e) {
        console.warn("Error checking auth session for notifications provider:", e);
      }
    })();

    return () => {
      try {
        if (unsubNotif) unsubNotif();
      } finally {
        try {
          if (unsubEmergencies) unsubEmergencies();
        } catch (e) {}
        try {
          if (unsubArrivals) unsubArrivals();
        } catch (e) {}
        try {
          if (authSub && typeof authSub.unsubscribe === "function") authSub.unsubscribe();
        } catch (e) {}
      }
      try {
        if (unregisterRealtimeRegistry) unregisterRealtimeRegistry();
      } catch (e) {}
    };
  }, []);

  return <>{children}</>;
}
