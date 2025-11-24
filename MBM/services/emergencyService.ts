import { Emergency } from "@/Modelo/Emergency";
import { supabase } from "./supabase";

export const getPendingArrivalAlerts = async (): Promise<Emergency[]> => {
  const { data, error } = await supabase
    .from("Emergencies")
    .select("*")
    .eq("received", false)
    .order("timeAlert", { ascending: false });
    if (error) throw error;
    return data ?? [];
};

export const acceptEmergencyAlert = async (id: number): Promise<Emergency> => {
  const { data, error } = await supabase
    .from("Emergencies")
    .update({ received: true })
    .eq("id", id)
    .select()
    .single();
    if (error) throw error;
    if (!data) throw new Error("No data returned from acceptEmergencyAlert");
    return data;
};

export type EmergencyChange = {
  eventType: string;
  new?: Emergency;
  old?: Emergency;
};


export const subscribeToPendingArrivalAlerts = (
  callback: (change: EmergencyChange) => void
): (() => void) => {
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
      } catch (e) {}
    };
  }

  callback({ eventType: "ERROR", new: undefined, old: undefined });
  return () => {};
};