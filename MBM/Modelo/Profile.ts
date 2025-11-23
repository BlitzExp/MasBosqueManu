export interface Profile {
  id?: string;
  name: string;
  nVisits: string;
  dateRegistered?: string | null;
  lastVisit?: string | null;
  role?: string | null;
  startSessionTime?: string | null;
}