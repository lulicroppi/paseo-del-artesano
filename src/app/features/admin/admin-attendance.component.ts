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
  name: string;
  emprendimiento: string;
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
    this.loadEvents();
    this.loadAttendees();
  }

  loadEvents(): void {
    // Load events from Firestore
    this.firestore.getAllEvents().subscribe(events => {
      this.events = events
        .map((e: any) => ({ id: e.id, eventName: e.eventName ?? e.name, date: e.date ?? '', time: e.time ?? '', enabled: e.enabled ?? true }))
        .filter((e: any) => e.enabled)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (this.events.length > 0) {
        this.selectedEventId = this.events[0].id;
      }
      this.filterAttendeesByEvent();
    });
  }

  loadAttendees(): void {
    // Load inscriptions from Firestore and map to attendees
    this.firestore.getAllInscriptions().subscribe(inscriptions => {
      this.attendees = inscriptions.map((ins: any) => ({
        id: ins.id,
        name: ins.name ?? ins.nameLastName ?? ins.userName ?? 'Participante',
        emprendimiento: ins.nameShop ?? ins.emprendimiento ?? '',
        eventId: ins.eventId?.toString() ?? (ins.idEvent ? String(ins.idEvent) : ''),
        status: ins.status === 'Asistio' || ins.assisted ? 'Asistio' : (ins.status === 'No asistio' ? 'No asistio' : 'Anotado')
      } as Attendee));
      this.filterAttendeesByEvent();
    }, err => console.error('Error loading inscriptions:', err));
  }

  filterAttendeesByEvent(): void {
    if (this.selectedEventId) {
      this.filteredAttendees = this.attendees.filter(a => a.eventId === this.selectedEventId);
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
