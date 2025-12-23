import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';

/**
 * FirestoreService - Handles Firestore database operations
 *
 * IMPORTANT (SSR / Prerender):
 * - During SSR/prerender, Firestore calls can timeout and fail builds.
 * - GitHub Pages is static, so we only fetch from Firestore in the browser.
 */
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);

  /** True only in the browser (NOT in SSR/prerender) */
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Fetch all users from Firestore
   * Collection: 'users'
   */
  getAllUsers(): Observable<any[]> {
    if (!this.isBrowser) return of([]);
    console.log('Fetching all users from Firestore...');
    return collectionData(collection(this.firestore, 'users'), { idField: 'id' }) as Observable<any[]>;
  }

  /**
   * Fetch specific user by ID/DNI
   */
  getUserById(userId: string): Observable<any> {
    if (!this.isBrowser) return of(null);
    console.log(`Fetching user with ID: ${userId}`);
    return docData(doc(this.firestore, 'users', userId), { idField: 'id' }) as Observable<any>;
  }

  /**
   * Fetch user by DNI field
   */
  getUserByDni(dni: number): Observable<any[]> {
    if (!this.isBrowser) return of([]);
    console.log(`Querying user by dni: ${dni}`);
    const q = query(collection(this.firestore, 'users'), where('dni', '==', Number(dni)));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  /**
   * Fetch all events from Firestore
   * Collection: 'events'
   */
  getAllEvents(): Observable<any[]> {
    if (!this.isBrowser) return of([]);
    console.log('Fetching all events from Firestore...');
    return collectionData(collection(this.firestore, 'events'), { idField: 'id' }) as Observable<any[]>;
  }

  /**
   * Fetch event by ID
   */
  getEventById(eventId: string): Observable<any> {
    if (!this.isBrowser) return of(null);
    console.log(`Fetching event with ID: ${eventId}`);
    return docData(doc(this.firestore, 'events', eventId), { idField: 'id' }) as Observable<any>;
  }

  /**
   * Fetch all inscriptions from Firestore
   * Collection: 'inscriptions'
   */
  getAllInscriptions(): Observable<any[]> {
    if (!this.isBrowser) return of([]);
    console.log('Fetching all inscriptions from Firestore...');
    return collectionData(collection(this.firestore, 'inscriptions'), { idField: 'id' }) as Observable<any[]>;
  }

  /**
   * Fetch inscriptions for a specific user
   */
  getUserInscriptions(userId: string): Observable<any[]> {
    if (!this.isBrowser) return of([]);
    console.log(`Fetching inscriptions for user: ${userId}`);
    const q = query(collection(this.firestore, 'inscriptions'), where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  /**
   * Fetch inscriptions for a specific event
   */
  getEventInscriptions(eventId: string): Observable<any[]> {
    if (!this.isBrowser) return of([]);
    console.log(`Fetching inscriptions for event: ${eventId}`);
    const q = query(collection(this.firestore, 'inscriptions'), where('eventId', '==', eventId));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  /**
   * Create a new user
   */
  createUser(userData: User): Promise<string> {
    if (!this.isBrowser) return Promise.reject('Firestore disabled during SSR/prerender');
    console.log('Creating new user:', userData);
    return addDoc(collection(this.firestore, 'users'), userData).then(docRef => docRef.id);
  }

  /**
   * Create a new event
   */
  createEvent(eventData: any): Promise<string> {
    if (!this.isBrowser) return Promise.reject('Firestore disabled during SSR/prerender');
    console.log('Creating new event:', eventData);
    return addDoc(collection(this.firestore, 'events'), eventData).then(docRef => docRef.id);
  }

  /**
   * Create a new inscription
   */
  createInscription(inscriptionData: any): Promise<string> {
    if (!this.isBrowser) return Promise.reject('Firestore disabled during SSR/prerender');
    console.log('Creating new inscription:', inscriptionData);
    return addDoc(collection(this.firestore, 'inscriptions'), inscriptionData).then(docRef => docRef.id);
  }

  /**
   * Update user data
   */
  updateUser(userId: string, userData: any): Promise<void> {
    if (!this.isBrowser) return Promise.reject('Firestore disabled during SSR/prerender');
    console.log(`Updating user ${userId}:`, userData);
    return updateDoc(doc(this.firestore, 'users', userId), userData);
  }

  /**
   * Update event data
   */
  updateEvent(eventId: string, eventData: any): Promise<void> {
    if (!this.isBrowser) return Promise.reject('Firestore disabled during SSR/prerender');
    console.log(`Updating event ${eventId}:`, eventData);
    return updateDoc(doc(this.firestore, 'events', eventId), eventData);
  }

  /**
   * Delete user by ID
   */
  deleteUser(userId: string): Promise<void> {
    if (!this.isBrowser) return Promise.reject('Firestore disabled during SSR/prerender');
    console.log(`Deleting user: ${userId}`);
    return deleteDoc(doc(this.firestore, 'users', userId));
  }

  /**
   * Delete event by ID
   */
  deleteEvent(eventId: string): Promise<void> {
    if (!this.isBrowser) return Promise.reject('Firestore disabled during SSR/prerender');
    console.log(`Deleting event: ${eventId}`);
    return deleteDoc(doc(this.firestore, 'events', eventId));
  }

  /**
   * Delete inscription by ID
   */
  deleteInscription(inscriptionId: string): Promise<void> {
    if (!this.isBrowser) return Promise.reject('Firestore disabled during SSR/prerender');
    console.log(`Deleting inscription: ${inscriptionId}`);
    return deleteDoc(doc(this.firestore, 'inscriptions', inscriptionId));
  }

  /**
   * Update inscription by ID
   */
  updateInscription(inscriptionId: string, data: any): Promise<void> {
    if (!this.isBrowser) return Promise.reject('Firestore disabled during SSR/prerender');
    console.log(`Updating inscription ${inscriptionId}:`, data);
    return updateDoc(doc(this.firestore, 'inscriptions', inscriptionId), data);
  }

  /**
   * Test method to console.log all data
   * (Browser only)
   */
  testConnection(): void {
    if (!this.isBrowser) return;

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
