export interface User {
  id?: string;            // Document ID in Firestore
  nameLastName: string;   // Full name (first + last name)
  dni: number;   // Unique identifier used as username (Argentina DNI)
  password: string;       // User password (for now local/mock; later Firebase Auth)
  nameShop: string;       // Store / shop name associated to user
  isAdmin: boolean;       // Role flag
}
