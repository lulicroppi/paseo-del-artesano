import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../core/services/firestore.service';

interface Event {
  id: string;
  eventName: string;
  date: string;
  time: string;
  enabled: boolean;
}

interface Attendee {
  id: string;
  nameLastName: string;
  nameShop: string;
  eventId: string;
  status: 'Anotado' | 'Asistio' | 'No asistio';
}

@Component({
  selector: 'app-admin-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-attendance.component.html',
  styleUrl: './admin-attendance.component.scss'
})
export class AdminAttendanceComponent implements OnInit {
  events: Event[] = [];
  attendees: Attendee[] = [];
  filteredAttendees: Attendee[] = [];
  selectedEventId: string = '';
  private firestore = inject(FirestoreService);

  ngOnInit(): void {
    // Initialize using cached-or-fetch reads (no extra button needed)
    this.loadEvents();
    this.loadAttendees();
  }

  async loadEvents(): Promise<void> {
    try {
      // Load events from Firestore (one-shot read)
      const events = await this.firestore.getAllEvents();
      this.events = events
        .map((e: any) => ({ id: e.id, eventName: e.eventName ?? e.name, date: e.date ?? '', time: e.time ?? '', enabled: e.enabled ?? true }))
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (this.events.length > 0) {
        this.selectedEventId = this.events[0].id;
      }
      this.filterAttendeesByEvent();
    } catch (err) {
      console.error('Error loading events from Firestore:', err);
    }
  }

  async loadEventsFromCache(): Promise<void> {
    try {
      const events = await this.firestore.getCachedAllEvents();
      this.events = events
        .map((e: any) => ({ id: e.id, eventName: e.eventName ?? e.name, date: e.date ?? '', time: e.time ?? '', enabled: e.enabled ?? true }))
        .filter((e: any) => e.enabled)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (this.events.length > 0 && !this.selectedEventId) {
        this.selectedEventId = this.events[0].id;
      }
      this.filterAttendeesByEvent();
    } catch (err) {
      console.error('Error loading cached events:', err);
    }
  }

  async loadAttendees(): Promise<void> {
    try {
      // Load inscriptions from Firestore and map to attendees (one-shot read)
      const inscriptions = await this.firestore.getAllInscriptions();
      this.attendees = inscriptions.map((ins: any) => ({
        id: ins.id,
        nameLastName: ins.nameLastName ?? ins.userName ?? 'Participante',
        nameShop: ins.nameShop ?? ins.emprendimiento ?? '',
        eventId: ins.eventId?.toString() ?? (ins.idEvent ? String(ins.idEvent) : ''),
        status: ins.status === 'Asistio' || ins.assisted ? 'Asistio' : (ins.status === 'No asistio' ? 'No asistio' : 'Anotado')
      } as Attendee));
      this.filterAttendeesByEvent();
    } catch (err) {
      console.error('Error loading inscriptions:', err);
    }
  }

  async loadAttendeesFromCache(): Promise<void> {
    try {
      const inscriptions = await this.firestore.getCachedAllInscriptions();
      this.attendees = inscriptions.map((ins: any) => ({
        id: ins.id,
        nameLastName: ins.nameLastName ?? ins.userName ?? 'Participante',
        nameShop: ins.nameShop ?? ins.emprendimiento ?? '',
        eventId: ins.eventId?.toString() ?? (ins.idEvent ? String(ins.idEvent) : ''),
        status: ins.status === 'Asistio' || ins.assisted ? 'Asistio' : (ins.status === 'No asistio' ? 'No asistio' : 'Anotado')
      } as Attendee));
      this.filterAttendeesByEvent();
    } catch (err) {
      console.error('Error loading cached inscriptions:', err);
    }
  }

  refreshAttendance(): Promise<void[]> {
    return Promise.all([this.loadEvents(), this.loadAttendees()]);
  }

  filterAttendeesByEvent(): void {
    if (this.selectedEventId) {
      this.filteredAttendees = this.attendees
        .filter(a => a.eventId === this.selectedEventId)
        .sort((a, b) => (a.nameShop || '').localeCompare(b.nameShop || ''));
    } else {
      this.filteredAttendees = [];
    }
  }

  onEventChange(): void {
    this.filterAttendeesByEvent();
  }

  getCheckedInCount(): number {
    return this.filteredAttendees.filter(a => a.status === 'Asistio').length;
  }

  getAbsentCount(): number {
    return this.filteredAttendees.filter(a => a.status === 'No asistio').length;
  }

  markAttended(attendee: Attendee): void {
    attendee.status = 'Asistio';
    // Persist change to Firestore
    this.firestore.updateInscription(attendee.id, { status: 'Asistio', assisted: true }).catch(err => console.error(err));
  }

  markNotAttended(attendee: Attendee): void {
    attendee.status = 'No asistio';
    this.firestore.updateInscription(attendee.id, { status: 'No asistio', assisted: false }).catch(err => console.error(err));
  }

  resetToRegistered(attendee: Attendee): void {
    attendee.status = 'Anotado';
    this.firestore.updateInscription(attendee.id, { status: 'Anotado' }).catch(err => console.error(err));
  }

  getEventName(eventId: string): string {
    const event = this.events.find(e => e.id === eventId);
    return event ? event.eventName : '';
  }
}
