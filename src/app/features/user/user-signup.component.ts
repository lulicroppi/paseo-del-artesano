import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  
  ngOnInit(): void {
    this.loadEnabledEvents();
  }

  loadEnabledEvents(): void {
    // Load events from admin (only enabled ones)
    const allEvents: Event[] = [
      { id: '1', eventName: 'Workshop Angular', date: '2025-01-15', time: '10:00', enabled: true },
      { id: '2', eventName: 'Artisan Fair', date: '2025-01-20', time: '09:00', enabled: true },
      { id: '3', eventName: 'Crafts Exhibition', date: '2025-02-01', time: '11:00', enabled: false }
    ];
    
    // Filter only enabled events and sort by latest date/time
    this.availableEvents = allEvents
      .filter(event => event.enabled)
      .sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
        const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
        return dateTimeB - dateTimeA; // Latest first
      });
  }

  signUpForEvent(event: Event): void {
    if (this.userSignups.has(event.id)) {
      this.showMessage(`Ya estás inscrito en ${event.eventName}`);
    } else {
      this.userSignups.add(event.id);
      this.showMessage(`¡Te has inscrito en ${event.eventName}!`);
    }
  }

  cancelSignup(event: Event): void {
    if (this.userSignups.has(event.id)) {
      this.userSignups.delete(event.id);
      this.showMessage(`Te has desinscrito de ${event.eventName}`);
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
