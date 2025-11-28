/**
 * Resilient Arrival Alerts Service
 * Handles arrival alert operations with offline-first approach
 */

import { ArrivalAlert } from "@/Modelo/ArrivalAlerts";
import { ensureAdmin } from "./authorization";
import { isOnline } from './connectionManager';
import * as localdatabase from './localdatabase';
import { supabase } from "./supabase";

type CreateArrivalInput = {
  userID?: string;
  name: string;
  arrivalTime: string;
  exitTime?: string | null;
};

export const createArrivalAlertResilient = async (
  alert: CreateArrivalInput
): Promise<ArrivalAlert> => {
  try {
    let resolvedUserID = alert.userID;
    if (!resolvedUserID && isOnline()) {
      const auth = await supabase.auth.getUser();
      resolvedUserID = auth.data?.user?.id;
    }

    if (isOnline()) {
      // Try online first
      const { data, error } = await supabase
        .from("ArrivalAlerts")
        .insert({
          name: alert.name,
          arrivalTime: alert.arrivalTime,
          exitTime: alert.exitTime,
          accepted: false,
          userID: resolvedUserID,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from createArrivalAlert");
      return data;
    } else {
      // Offline - save locally
      const localId = await localdatabase.saveArrivalAlertLocally({
        ...alert,
        userID: resolvedUserID,
        accepted: false,
      });
      console.log('⚠️ Offline: Arrival alert saved locally for sync');
      return { ...alert, id: localId, accepted: false } as any;
    }
  } catch (error) {
    console.warn('Failed to create arrival alert online, saving locally:', error);
    
    // Fallback to local
    const localId = await localdatabase.saveArrivalAlertLocally({
      ...alert,
      accepted: false,
    });
    return { ...alert, id: localId, accepted: false } as any;
  }
};

export const getPendingArrivalAlertsResilient = async (): Promise<ArrivalAlert[]> => {
  try {
    const isAdmin = await ensureAdmin();
    if (!isAdmin) throw new Error("Not authorized");

    if (isOnline()) {
      // Try online first
      const { data, error } = await supabase
        .from("ArrivalAlerts")
        .select("*")
        .eq("accepted", false)
        .order("arrivalTime", { ascending: false });

      if (error) throw error;
      return data ?? [];
    } else {
      // Fallback to local
      const localAlerts = await localdatabase.getPendingArrivalAlerts();
      return localAlerts as any;
    }
  } catch (error) {
    console.warn('Failed to get arrival alerts from online, using local:', error);
    const localAlerts = await localdatabase.getPendingArrivalAlerts();
    return localAlerts as any;
  }
};

export const acceptArrivalAlertResilient = async (id: number): Promise<ArrivalAlert> => {
  try {
    if (!isOnline()) {
      throw new Error('Cannot accept arrival alert while offline');
    }

    const { data, error } = await supabase
      .from("ArrivalAlerts")
      .update({ accepted: true })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("No data returned from acceptArrivalAlert");
    return data;
  } catch (error) {
    console.error('Accept arrival alert error:', error);
    throw error;
  }
};

export type ArrivalAlertChange = {
  eventType: string;
  new?: ArrivalAlert;
  old?: ArrivalAlert;
};

export const subscribeToPendingArrivalAlertsResilient = async (
  callback: (change: ArrivalAlertChange) => void
): Promise<() => void> => {
  try {
    const isAdmin = await ensureAdmin();
    if (!isAdmin) {
      return () => {};
    }

    if (!isOnline()) {
      console.log('⚠️ Offline: Arrival alert subscriptions will work when online');
      return () => {};
    }

    const anySupabase = supabase as any;

    if (typeof anySupabase.channel === "function") {
      const channel = anySupabase
        .channel("public:ArrivalAlerts")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "ArrivalAlerts", filter: "accepted=eq.false" },
          (payload: any) => {
            const evt = payload.event || payload.type || payload.eventType || "UNKNOWN";
            const newRecord = payload.new as ArrivalAlert | undefined;
            const oldRecord = payload.old as ArrivalAlert | undefined;
            callback({ eventType: evt, new: newRecord, old: oldRecord });
          }
        )
        .subscribe();

      return () => {
        try {
          if (typeof anySupabase.removeChannel === "function") anySupabase.removeChannel(channel);
          else if (channel && typeof channel.unsubscribe === "function") channel.unsubscribe();
        } catch (e) {
          console.error('Unsubscribe error:', e);
        }
      };
    }

    if (typeof anySupabase.from === "function") {
      const sub = anySupabase
        .from("ArrivalAlerts")
        .on("INSERT", (payload: any) => {
          if (payload.record?.accepted === false) callback({ eventType: "INSERT", new: payload.record });
        })
        .on("UPDATE", (payload: any) => {
          const rec = payload.record || payload.new || payload;
          if (rec) callback({ eventType: "UPDATE", new: rec, old: payload.old_record });
        })
        .on("DELETE", (payload: any) => {
          if (payload.old_record?.accepted === false) callback({ eventType: "DELETE", old: payload.old_record });
        })
        .subscribe();

      return () => {
        try {
          if (typeof anySupabase.removeSubscription === "function") anySupabase.removeSubscription(sub);
          else if (sub && typeof sub.unsubscribe === "function") sub.unsubscribe();
        } catch (e) {
          console.error('Unsubscribe error:', e);
        }
      };
    }

    callback({ eventType: "ERROR", new: undefined, old: undefined });
    return () => {};
  } catch (error) {
    console.error('Subscribe error:', error);
    return () => {};
  }
};
