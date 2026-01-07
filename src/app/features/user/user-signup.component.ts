import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../core/services/firestore.service';
import { AuthService } from '../../core/services/auth.service';

interface Event {
  id: string;
  eventName: string;
  date: string;
  time: string;
  enabled: boolean;
}

@Component({
  selector: 'app-user-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-signup.component.html',
  styleUrl: './user-signup.component.scss'
})
export class UserSignupComponent implements OnInit {
  availableEvents: Event[] = [];
  userSignups: Set<string> = new Set();
  showConfirmation: boolean = false;
  confirmationMessage: string = '';
  // Map of date (YYYY-MM-DD) -> total inscriptions count
  signupCountsByDate: Record<string, number> = {};
  
  private firestore = inject(FirestoreService);
  private authService = inject(AuthService);
  
  ngOnInit(): void {
    this.loadEnabledEvents();
    this.loadUserSignups();
    this.loadSignupCountsByDate();
  }

  async loadEnabledEvents(): Promise<void> {
    // Load events from Firestore (one-shot read)
    try {
      const events = await this.firestore.getAllEvents();
      this.availableEvents = events
        .map(e => ({
          id: e.id,
          eventName: e.eventName ?? e.name ?? 'Evento',
          date: e.date ?? (e.eventDate ? new Date(e.eventDate.seconds ? e.eventDate.seconds * 1000 : e.eventDate).toISOString().split('T')[0] : ''),
          time: e.time ?? '',
          enabled: e.enabled ?? true
        } as Event))
        .filter(event => event.enabled)
        .sort((a, b) => {
          const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
          const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
          return dateTimeB - dateTimeA; // Latest first
        });
    } catch (err) {
      console.error('Error loading events from Firestore:', err);
    }
  }

  /** Normalize date string to YYYY-MM-DD */
  private normalizeDateString(dateStr: string): string {
    try {
      // If already in YYYY-MM-DD, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  }

  /** Load total inscriptions counts grouped by event date */
  async loadSignupCountsByDate(): Promise<void> {
    try {
      const inscriptions = await this.firestore.getAllInscriptions();
      const counts: Record<string, number> = {};
      for (const ins of inscriptions) {
        const rawDate = String(ins.eventDate ?? ins.date ?? '');
        if (!rawDate) continue;
        const key = this.normalizeDateString(rawDate);
        counts[key] = (counts[key] ?? 0) + 1;
      }
      this.signupCountsByDate = counts;
    } catch (err) {
      console.error('Error loading inscription counts:', err);
    }
  }

  /** Get total inscriptions for a given event date */
  getSignupCountForDate(date: string): number {
    const key = this.normalizeDateString(date);
    return this.signupCountsByDate[key] ?? 0;
  }

  async loadUserSignups(): Promise<void> {
    // Load current user's inscriptions (one-shot read)
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.dni) {
      try {
        const inscriptions = await this.firestore.getUserInscriptions(String(currentUser.dni));
        this.userSignups = new Set(inscriptions.map(ins => ins.eventId?.toString() ?? String(ins.idEvent)));
      } catch (err) {
        console.error('Error loading user signups:', err);
      }
    }
  }

  signUpForEvent(event: Event): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.dni) {
      this.showMessage('Debes estar autenticado para inscribirse');
      return;
    }

    if (this.userSignups.has(event.id)) {
      this.showMessage(`Ya estás inscrito en ${event.eventName}`);
    } else {
      // Create inscription in Firestore
      
      this.firestore.createInscription({
        userId: String(currentUser.dni),
        eventId: event.id,
        status: 'Anotado',
        nameLastName: currentUser.nameLastName,
        nameShop: currentUser.nameShop,
        createdAt: new Date().toISOString(),
        eventDate: event.date,
        time: event.time
      }).then(() => {
        this.userSignups.add(event.id);
        // Update local count for this date
        const key = this.normalizeDateString(event.date);
        this.signupCountsByDate[key] = (this.signupCountsByDate[key] ?? 0) + 1;
        this.showMessage(`¡Te has registrado!`);
      }).catch(err => {
        console.error('Error creating inscription:', err);
        this.showMessage('Error al inscribirse. Intenta de nuevo.');
      });
    }
  }

  async cancelSignup(event: Event): Promise<void> {
    if (!this.userSignups.has(event.id)) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.dni) return;

    try {
      const inscriptions = await this.firestore.getAllInscriptions();
      const inscription = inscriptions.find(ins => ins.eventId === event.id && ins.userId === String(currentUser.dni));
      if (inscription) {
        await this.firestore.deleteInscription(inscription.id);
        this.userSignups.delete(event.id);
        // Update local count for this date
        const key = this.normalizeDateString(event.date);
        const current = this.signupCountsByDate[key] ?? 0;
        this.signupCountsByDate[key] = Math.max(0, current - 1);
        this.showMessage(`Te has dado de baja`);
      }
    } catch (err) {
      console.error('Error fetching/deleting inscription:', err);
      this.showMessage('Error al desinscribirse. Intenta de nuevo.');
    }
  }

  isSignedUp(eventId: string): boolean {
    return this.userSignups.has(eventId);
  }

  showMessage(message: string): void {
    this.confirmationMessage = message;
    this.showConfirmation = true;
    setTimeout(() => {
      this.showConfirmation = false;
    }, 3000);
  }
}
