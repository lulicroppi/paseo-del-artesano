export interface Event {
  id: string;
  fecha: Date;  // Firestore Timestamp
  enabled?: boolean;
}
