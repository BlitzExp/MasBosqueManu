import { ArrivalAlert } from "@/Modelo/ArrivalAlerts";
import { supabase } from "./supabase";

type CreateArrivalInput = {
  userID?: string;
  name: string;
  arrivalTime: string;
  exitTime?: string | null;
};

export const createArrivalAlert = async (
  alert: CreateArrivalInput
): Promise<ArrivalAlert> => {
  const { userID, name, arrivalTime, exitTime } = alert;

  let resolvedUserID = userID;
  if (!resolvedUserID) {
    const auth = await supabase.auth.getUser();
    resolvedUserID = auth.data?.user?.id;
    if (!resolvedUserID) throw new Error("No authenticated user available");
  }

  const { data, error } = await supabase
    .from("ArrivalAlerts")
    .insert({
      name,
      arrivalTime,
      exitTime,
      accepted: false,
      userID: resolvedUserID,
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("No data returned from createArrivalAlert");
  return data;
};

export const getPendingArrivalAlerts = async (): Promise<ArrivalAlert[]> => {
  const { data, error } = await supabase
    .from("ArrivalAlerts")
    .select("*")
    .eq("accepted", false)
    .order("arrivalTime", { ascending: false });

  if (error) throw error;
  return data ?? [];
};

export const acceptArrivalAlert = async (id: number): Promise<ArrivalAlert> => {
  const { data, error } = await supabase
    .from("ArrivalAlerts")
    .update({ accepted: true })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("No data returned from acceptArrivalAlert");
  return data;
};

export type ArrivalAlertChange = {
  eventType: string;
  new?: ArrivalAlert;
  old?: ArrivalAlert;
};

export const subscribeToPendingArrivalAlerts = (
  callback: (change: ArrivalAlertChange) => void
): (() => void) => {
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
      } catch (e) {}
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
      } catch (e) {}
    };
  }

  callback({ eventType: "ERROR", new: undefined, old: undefined });
  return () => {};
};


