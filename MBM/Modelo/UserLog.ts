export interface UserLog {
  id?: string;
  userID: string;
  name: string;
  logDate: string;
  ingressTime?: string | null;
  exitTime?: string | null;
  description?: string | null;
  image?: string | null;
}