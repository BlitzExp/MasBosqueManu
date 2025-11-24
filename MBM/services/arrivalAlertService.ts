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

  // Resolve userID: prefer provided value, otherwise use authenticated user
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


