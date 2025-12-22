export interface Inscription {
  id: string;
  idEvent: string;        // Event ID reference
  dniUser: string | number; // User DNI
  nameShop: string;       // User's shop name
  eventDate: Date | any;  // Firestore Timestamp
  assisted: boolean;      // Attendance status
}
