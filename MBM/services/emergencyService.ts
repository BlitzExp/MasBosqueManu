import { Emergency } from "@/Modelo/Emergency";
import { ensureAdmin } from "./authorization";
import { supabase } from "./supabase";

export const getPendingArrivalAlerts = async (): Promise<Emergency[]> => {
  const isAdmin = await ensureAdmin();
  if (!isAdmin) throw new Error("Not authorized");

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


export const subscribeToPendingArrivalAlerts = async (
  callback: (change: EmergencyChange) => void
): Promise<() => void> => {
  const isAdmin = await ensureAdmin();
  if (!isAdmin) return () => {};

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

export const mapEmergencyPointName = async (pointID: number): Promise<string> => {

    const { data, error } = await supabase
      .from("emergencyLocations")
      .select("*")
      .eq("id", pointID)
      .single();
      if (error) {
        console.error("Error fetching emergency location:", error);
        return "Ubicación desconocida";
      }
      return data?.name ?? "Ubicación desconocida";
}
