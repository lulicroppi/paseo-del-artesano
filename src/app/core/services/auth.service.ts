import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';
import { FirestoreService } from './firestore.service';

/**
 * AuthService
 * Handles authentication logic
 *
 * Phase 1: Local / Firestore-based authentication
 * Phase 2: Firebase Auth (onAuthStateChanged)
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private firestoreService = inject(FirestoreService);

  /** Internal auth state */
  private currentUserSubject = new BehaviorSubject<User | null>(
    this.loadUserFromStorage()
  );

  /** Public observable */
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Debug (optional)
    this.currentUser$.subscribe(user => {
      console.log('[AuthService] current user:', user);
    });
  }

  /**
   * Login using Firestore (dni + password)
   * One-shot read - no subscriptions
   */
  async login(dni: number, password: string): Promise<boolean> {
    try {
      const users = await this.firestoreService.getUserByDni(Number(dni));

      if (!users || users.length === 0) return false;

      const user = users[0] as User;

      if (user.password !== password) return false;

      // Remove password before storing
      const { password: _, ...safeUser } = user;

      this.setUser(safeUser);
      return true;
    } catch (error) {
      console.error('[AuthService] login error:', error);
      return false;
    }
  }

  /**
   * Logout and clear session
   */
  logout(): void {
    this.currentUserSubject.next(null);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
  }

  /**
   * Synchronous access to current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Auth state helpers
   */
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return !!this.currentUserSubject.value?.isAdmin;
  }

  /**
   * Persist user to memory + storage
   */
  private setUser(user: any): void {
    this.currentUserSubject.next(user);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  /**
   * Restore session from localStorage
   * Called ONLY on service initialization
   */
  private loadUserFromStorage(): User | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;

    try {
      return JSON.parse(raw) as User;
    } catch (err) {
      console.error('[AuthService] Failed to parse stored user:', err);
      return null;
    }
  }

  /**
   * 🔥 Firebase-ready hook (future)
   *
   * Example:
   *
   * onAuthStateChanged(auth, firebaseUser => {
   *   if (firebaseUser) {
   *     this.setUser(mappedUser);
   *   } else {
   *     this.logout();
   *   }
   * });
   */
}
