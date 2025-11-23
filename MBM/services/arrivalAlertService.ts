import { supabase } from "./supabase";

export const createArrivalAlert = async (alert) => {
  const { userID, name, arrivalTime, exitTime } = alert;

  const { data, error } = await supabase
    .from("ArrivalAlerts")
    .insert({
      userID,
      name,
      arrivalTime,
      exitTime,
      accepted: false
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPendingArrivalAlerts = async () => {
  const { data, error } = await supabase
    .from("ArrivalAlerts")
    .select("*")
    .eq("accepted", false)
    .order("arrivalTime", { ascending: false });

  if (error) throw error;
  return data;
};

export const acceptArrivalAlert = async (id) => {
  const { data, error } = await supabase
    .from("ArrivalAlerts")
    .update({ accepted: true })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
