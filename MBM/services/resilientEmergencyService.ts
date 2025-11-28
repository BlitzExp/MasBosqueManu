/**
 * Resilient Emergency Service
 * Handles emergency alerts with offline-first approach
 */

import { Emergency } from "@/Modelo/Emergency";
import { ensureAdmin } from "./authorization";
import { isOnline } from './connectionManager';
import * as localdatabase from './localdatabase';
import { supabase } from "./supabase";

export const createEmergencyResilient = async (emergency: Omit<Emergency, 'id'>): Promise<Emergency> => {
  try {
    if (isOnline()) {
      // Try online first
      const { data, error } = await supabase
        .from('Emergencies')
        .insert(emergency)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Offline - save locally
      const localId = await localdatabase.saveEmergencyLocally(emergency);
      console.log('⚠️ Offline: Emergency saved locally for sync');
      return { ...emergency, id: localId } as any;
    }
  } catch (error) {
    console.warn('Failed to create emergency online, saving locally:', error);
    const localId = await localdatabase.saveEmergencyLocally(emergency);
    return { ...emergency, id: localId } as any;
  }
};

export const getPendingArrivalAlertsResilient = async (): Promise<Emergency[]> => {
  try {
    const isAdmin = await ensureAdmin();
    if (!isAdmin) throw new Error("Not authorized");

    if (isOnline()) {
      // Try online first
      const { data, error } = await supabase
        .from("Emergencies")
        .select("*")
        .eq("received", false)
        .order("timeAlert", { ascending: false });
      
      if (error) throw error;
      return data ?? [];
    } else {
      // Fallback to local
      const localEmergencies = await localdatabase.getPendingEmergencies();
      return localEmergencies as any;
    }
  } catch (error) {
    console.warn('Failed to get emergencies from online, using local:', error);
    const localEmergencies = await localdatabase.getPendingEmergencies();
    return localEmergencies as any;
  }
};

export const acceptEmergencyAlertResilient = async (id: number): Promise<Emergency> => {
  try {
    if (!isOnline()) {
      throw new Error('Cannot accept emergency while offline');
    }

    const { data, error } = await supabase
      .from("Emergencies")
      .update({ received: true })
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error("No data returned from acceptEmergencyAlert");
    
    return data;
  } catch (error) {
    console.error('Accept emergency alert error:', error);
    throw error;
  }
};

export type EmergencyChange = {
  eventType: string;
  new?: Emergency;
  old?: Emergency;
};

export const subscribeToPendingEmergenciesResilient = async (
  callback: (change: EmergencyChange) => void
): Promise<() => void> => {
  try {
    const isAdmin = await ensureAdmin();
    if (!isAdmin) return () => {};

    if (!isOnline()) {
      console.log('⚠️ Offline: Emergency subscriptions will work when online');
      return () => {};
    }

    const anySupabase = supabase as any;

    if (typeof anySupabase.channel === "function") {
      const channel = anySupabase
        .channel("public:Emergencies")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "Emergencies", filter: "received=eq.false" },
          (payload: any) => {
            const evt = payload.event || payload.type || payload.eventType || "UNKNOWN";
            const newRecord = payload.new as Emergency | undefined;
            const oldRecord = payload.old as Emergency | undefined;
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
        .from("Emergencies")
        .on("INSERT", (payload: any) => {
          if (payload.record?.received === false) callback({ eventType: "INSERT", new: payload.record });
        })
        .on("UPDATE", (payload: any) => {
          const rec = payload.record || payload.new || payload;
          if (rec) callback({ eventType: "UPDATE", new: rec, old: payload.old_record });
        })
        .on("DELETE", (payload: any) => {
          if (payload.old_record?.received === false) callback({ eventType: "DELETE", old: payload.old_record });
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
