export interface ArrivalAlert {
  id?: number;
  name: string;
  arrivalTime: string;
  exitTime?: string | null;
  accepted: boolean;
  userID: string;
}