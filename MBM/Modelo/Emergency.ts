export interface Emergency {
  id?: number;
  timeAlert: string;
  arrivalTime: string | null;
  localizationID?: string;
  date: string | null;
  received: boolean;
}