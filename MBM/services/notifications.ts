import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

type PushPayload = {
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationReady() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== "granted") {
    throw new Error("Notification permission not granted");
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
    });
  }
}

export async function getExpoPushToken(): Promise<string | null> {
  await ensureNotificationReady();
  if (!Device.isDevice) return null;
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token ?? null;
}

export async function scheduleLocalNotification(payload: PushPayload, inSeconds = 5) {
  await ensureNotificationReady();
  return Notifications.scheduleNotificationAsync({
    content: {
      title: payload.title,
      body: payload.body ?? "",
      data: payload.data ?? {},
      sound: payload.sound ?? "default",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: inSeconds,
      repeats: false,
    },
  });
}


export async function sendExpoServerPush(
  expoPushToken: string,
  payload: PushPayload
) {
  await ensureNotificationReady();
  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: expoPushToken,
      title: payload.title,
      body: payload.body,
      sound: payload.sound ?? "default",
      data: payload.data ?? {},
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

export function subscribeNotificationEvents(opts: {
  onReceived?: (n: Notifications.Notification) => void;
  onResponse?: (r: Notifications.NotificationResponse) => void;
}) {
  const subs: Array<{ remove: () => void }> = [];

  if (opts.onReceived) {
    const s = Notifications.addNotificationReceivedListener(opts.onReceived);
    subs.push(s);
  }
  if (opts.onResponse) {
    const s = Notifications.addNotificationResponseReceivedListener(opts.onResponse);
    subs.push(s);
  }
  return () => subs.forEach(s => s.remove());
}

export function isSimulator(): boolean {
  return !Device.isDevice;
}
