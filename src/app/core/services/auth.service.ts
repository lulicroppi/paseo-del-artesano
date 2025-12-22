import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

/**
 * AuthService - Handles authentication logic
 * 
 * Phase 1 (Current): Mock/Local authentication
 * Phase 2 (Commented): Firebase Authentication integration
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  /**
   * Mock users for development/testing
   * In production, these will be replaced with Firebase Auth
   */
  private mockUsers: User[] = [
    {
      nameLastName: 'Lucia Croppi',
      dni: 40317458,
      password: 'test123',
      nameShop: 'EternalGlow Funes',
      isAdmin: true
    },
    {
      nameLastName: 'María López',
      dni: 87654321,
      password: 'user123',
      nameShop: 'Cerámica López',
      isAdmin: false
    },
    {
      nameLastName: 'Carlos Rodríguez',
      dni: 11223344,
      password: 'user123',
      nameShop: 'Artesanías Rodríguez',
      isAdmin: false
    }
  ];

  constructor() {
    // Optional: Log current user state on init
    this.currentUser$.subscribe(user => {
      if (user) {
        console.log('User logged in:', user.nameLastName);
      }
    });
  }

  /**
   * Login method
   * @param dni - User DNI (username)
   * @param password - User password
   * @returns true if login successful, false otherwise
   */
  login(dni: number, password: string): boolean {
    const user = this.mockUsers.find(u => u.dni === Number(dni) && u.password === password);
    
    if (user) {
      // Remove password before storing in state
      const userWithoutPassword = { ...user };
      delete (userWithoutPassword as any).password;
      
      this.currentUserSubject.next(user);
      
      // Only save to localStorage in browser environment
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      }
      return true;
    }
    
    return false;
  }

  /**
   * Logout method
   */
  logout(): void {
    this.currentUserSubject.next(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
  }

  /**
   * Get current user synchronously
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return this.currentUserSubject.value?.isAdmin ?? false;
  }

  /**
   * Load user from localStorage if available
   */
  private loadUserFromStorage(): User | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        return null;
      }
    }
    return null;
  }

  /**
   * Get mock users (for development only)
   */
  getMockUsers(): User[] {
    return this.mockUsers;
  }

//   /**
//    * ============ FIREBASE INTEGRATION (COMMENTED) ============
//    * 
//    * To enable Firebase authentication, uncomment the code below
//    * and install required packages:
//    * 
//    * npm install firebase @angular/fire
//    * 
//    * Then follow these steps:
//    * 1. Create a Firebase project at https://firebase.google.com
//    * 2. Add your Firebase config to environment.ts
//    * 3. Uncomment the code below
//    * 4. Update this service to use FirebaseAuth and Firestore
//    */

//   /**
//    * // import { initializeApp } from 'firebase/app';
//    * // import { Auth, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
//    * // import { Firestore, getFirestore, doc, getDoc } from 'firebase/firestore';
//    * // import { environment } from '../../../../environments/environment';
//    * 
//    * // private auth: Auth;
//    * // private firestore: Firestore;
//    * 
//    * // constructor() {
//    * //   // Initialize Firebase
//    * //   const app = initializeApp(environment.firebase);
//    * //   this.auth = getAuth(app);
//    * //   this.firestore = getFirestore(app);
//    * // }
//    * 
//    * // /**
//    * //  * Login with Firebase Authentication
//    * //  * Uses email as identifier (can be mapped from DNI)
//    * //  */
//    * // loginWithFirebase(email: string, password: string): Observable<User | null> {
//    * //   return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
//    * //     switchMap(credential => this.getUserProfileFromFirestore(credential.user.uid)),
//    * //     tap(user => {
//    * //       if (user) {
//    * //         this.currentUserSubject.next(user);
//    * //       }
//    * //     }),
//    * //     catchError(error => {
//    * //       console.error('Firebase login error:', error);
//    * //       return of(null);
//    * //     })
//    * //   );
//    * // }
//    * 
//    * // /**
//    * //  * Fetch user profile from Firestore
//    * //  */
//    * // private getUserProfileFromFirestore(uid: string): Observable<User | null> {
//    * //   return from(getDoc(doc(this.firestore, 'users', uid))).pipe(
//    * //     map(docSnap => {
//    * //       if (docSnap.exists()) {
//    * //         return docSnap.data() as User;
//    * //       }
//    * //       return null;
//    * //     })
//    * //   );
//    * // }
//    * 
//    * // /**
//    * //  * Logout from Firebase
//    * //  */
//    * // logoutWithFirebase(): Observable<void> {
//    * //   return from(this.auth.signOut()).pipe(
//    * //     tap(() => {
//    * //       this.currentUserSubject.next(null);
//    * //     })
//    * //   );
//    * // }
//    */
}
