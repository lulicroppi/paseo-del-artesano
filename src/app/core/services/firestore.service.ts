import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

/**
 * FirestoreService - Handles Firestore database operations
 * 
 * Collections:
 * - users: User profiles with their shop information
 * - events: Events managed by admins
 * - inscriptions: User registrations for events
 * 
 * Firebase Configuration: Connected and initialized in app.config.ts
 */
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore);

  /**
   * Fetch all users from Firestore
   * Collection: 'users'
   */
  getAllUsers(): Observable<any[]> {
    console.log('Fetching all users from Firestore...');
    return collectionData(collection(this.firestore, 'users'), { idField: 'id' }) as Observable<any[]>;
  }

  /**
   * Fetch specific user by ID/DNI
   * @param userId - User ID or DNI
   */
  getUserById(userId: string): Observable<any> {
    console.log(`Fetching user with ID: ${userId}`);
    return docData(doc(this.firestore, 'users', userId), { idField: 'id' }) as Observable<any>;
  }

  /**
   * Fetch all events from Firestore
   * Collection: 'events'
   */
  getAllEvents(): Observable<any[]> {
    console.log('Fetching all events from Firestore...');
    return collectionData(collection(this.firestore, 'events'), { idField: 'id' }) as Observable<any[]>;
  }

  /**
   * Fetch event by ID
   * @param eventId - Event ID
   */
  getEventById(eventId: string): Observable<any> {
    console.log(`Fetching event with ID: ${eventId}`);
    return docData(doc(this.firestore, 'events', eventId), { idField: 'id' }) as Observable<any>;
  }

  /**
   * Fetch all inscriptions from Firestore
   * Collection: 'inscriptions'
   */
  getAllInscriptions(): Observable<any[]> {
    console.log('Fetching all inscriptions from Firestore...');
    return collectionData(collection(this.firestore, 'inscriptions'), { idField: 'id' }) as Observable<any[]>;
  }

  /**
   * Fetch inscriptions for a specific user
   * @param userId - User ID or DNI
   */
  getUserInscriptions(userId: string): Observable<any[]> {
    console.log(`Fetching inscriptions for user: ${userId}`);
    const q = query(
      collection(this.firestore, 'inscriptions'),
      where('userId', '==', userId)
    );
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  /**
   * Fetch inscriptions for a specific event
   * @param eventId - Event ID
   */
  getEventInscriptions(eventId: string): Observable<any[]> {
    console.log(`Fetching inscriptions for event: ${eventId}`);
    const q = query(
      collection(this.firestore, 'inscriptions'),
      where('eventId', '==', eventId)
    );
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  /**
   * Create a new user
   * @param userData - User data object
   */
  createUser(userData: any): Promise<string> {
    console.log('Creating new user:', userData);
    return addDoc(collection(this.firestore, 'users'), userData).then(docRef => docRef.id);
  }

  /**
   * Create a new event
   * @param eventData - Event data object
   */
  createEvent(eventData: any): Promise<string> {
    console.log('Creating new event:', eventData);
    return addDoc(collection(this.firestore, 'events'), eventData).then(docRef => docRef.id);
  }

  /**
   * Create a new inscription
   * @param inscriptionData - Inscription data object
   */
  createInscription(inscriptionData: any): Promise<string> {
    console.log('Creating new inscription:', inscriptionData);
    return addDoc(collection(this.firestore, 'inscriptions'), inscriptionData).then(docRef => docRef.id);
  }

  /**
   * Update user data
   * @param userId - User ID
   * @param userData - Updated user data
   */
  updateUser(userId: string, userData: any): Promise<void> {
    console.log(`Updating user ${userId}:`, userData);
    return updateDoc(doc(this.firestore, 'users', userId), userData);
  }

  /**
   * Update event data
   * @param eventId - Event ID
   * @param eventData - Updated event data
   */
  updateEvent(eventId: string, eventData: any): Promise<void> {
    console.log(`Updating event ${eventId}:`, eventData);
    return updateDoc(doc(this.firestore, 'events', eventId), eventData);
  }

  /**
   * Delete user by ID
   * @param userId - User ID
   */
  deleteUser(userId: string): Promise<void> {
    console.log(`Deleting user: ${userId}`);
    return deleteDoc(doc(this.firestore, 'users', userId));
  }

  /**
   * Delete event by ID
   * @param eventId - Event ID
   */
  deleteEvent(eventId: string): Promise<void> {
    console.log(`Deleting event: ${eventId}`);
    return deleteDoc(doc(this.firestore, 'events', eventId));
  }

  /**
   * Delete inscription by ID
   * @param inscriptionId - Inscription ID
   */
  deleteInscription(inscriptionId: string): Promise<void> {
    console.log(`Deleting inscription: ${inscriptionId}`);
    return deleteDoc(doc(this.firestore, 'inscriptions', inscriptionId));
  }

  /**
   * Test method to console.log all data
   * Useful for debugging and testing the connection
   */
  testConnection(): void {
    console.group('🔥 Firestore Service - Connection Test');
    
    console.log('📋 Fetching all users...');
    this.getAllUsers().subscribe(
      users => console.log('Users:', users),
      error => console.error('Error fetching users:', error),
      () => console.log('Users fetch completed')
    );

    console.log('📅 Fetching all events...');
    this.getAllEvents().subscribe(
      events => console.log('Events:', events),
      error => console.error('Error fetching events:', error),
      () => console.log('Events fetch completed')
    );

    console.log('✍️  Fetching all inscriptions...');
    this.getAllInscriptions().subscribe(
      inscriptions => console.log('Inscriptions:', inscriptions),
      error => console.error('Error fetching inscriptions:', error),
      () => console.log('Inscriptions fetch completed')
    );

    console.groupEnd();
  }
}
