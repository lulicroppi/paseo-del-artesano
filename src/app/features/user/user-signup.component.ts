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
  
  private firestore = inject(FirestoreService);
  private authService = inject(AuthService);
  
  ngOnInit(): void {
    this.loadEnabledEvents();
    this.loadUserSignups();
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
