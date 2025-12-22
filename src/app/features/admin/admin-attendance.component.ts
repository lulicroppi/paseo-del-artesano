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

  ngOnInit(): void {
    this.loadEvents();
    this.loadAttendees();
  }

  loadEvents(): void {
    // Load events from admin-dates (only enabled events)
    const allEvents: Event[] = [
      { id: '1', eventName: 'Workshop Angular', date: '2025-01-15', time: '10:00', enabled: true },
      { id: '2', eventName: 'Artisan Fair', date: '2025-01-20', time: '09:00', enabled: true },
      { id: '3', eventName: 'Crafts Exhibition', date: '2025-02-01', time: '11:00', enabled: false }
    ];
    this.events = allEvents
      .filter(e => e.enabled)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (this.events.length > 0) {
      this.selectedEventId = this.events[0].id;
    }
  }

  loadAttendees(): void {
    // Load sample attendees data
    this.attendees = [
      { id: '1', name: 'Juan García', emprendimiento: 'Cerámica Artesanal', eventId: '1', status: 'Anotado' },
      { id: '2', name: 'María López', emprendimiento: 'Textiles Andinos', eventId: '1', status: 'Anotado' },
      { id: '3', name: 'Carlos Ruiz', emprendimiento: 'Joyería Tradicional', eventId: '1', status: 'Anotado' },
      { id: '4', name: 'Ana Martínez', emprendimiento: 'Artesanía en Madera', eventId: '1', status: 'Anotado' },
      { id: '5', name: 'Pedro Sánchez', emprendimiento: 'Productos Orgánicos', eventId: '2', status: 'Anotado' },
      { id: '6', name: 'Laura García', emprendimiento: 'Bordados Étnicos', eventId: '2', status: 'Anotado' },
      { id: '7', name: 'Roberto López', emprendimiento: 'Trabajos en Cuero', eventId: '2', status: 'Anotado' }
    ];
    this.filterAttendeesByEvent();
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
  }

  markNotAttended(attendee: Attendee): void {
    attendee.status = 'No asistio';
  }

  resetToRegistered(attendee: Attendee): void {
    attendee.status = 'Anotado';
  }

  getEventName(eventId: string): string {
    const event = this.events.find(e => e.id === eventId);
    return event ? event.eventName : '';
  }
}
