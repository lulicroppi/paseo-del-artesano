export interface Event {
  id: string;
  fecha: Date | any;  // Firestore Timestamp
  enabled?: boolean;
}
