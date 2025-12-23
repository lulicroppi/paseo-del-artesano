export interface Inscription {
  id: string;
  idEvent: string;        // Event ID reference
  dniUser: string | number; // User DNI
  nameShop: string;       // User's shop name
  eventDate: Date;  // Firestore Timestamp
  assisted: boolean;      // Attendance status
}
