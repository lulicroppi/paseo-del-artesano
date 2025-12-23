import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../core/services/firestore.service';

interface EventDate {
  id: string;
  eventName: string;
  date: string;
  time: string;
  enabled: boolean;
}

@Component({
  selector: 'app-admin-dates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dates.component.html',
  styleUrl: './admin-dates.component.scss'
})
export class AdminDatesComponent implements OnInit, OnDestroy {
  datesList: EventDate[] = [];
  showForm: boolean = false;
  isEditing: boolean = false;
  isSaving: boolean = false;
  currentDate: EventDate = this.createEmptyDate();
  private checkInterval: any;
  private firestore = inject(FirestoreService);

  ngOnInit(): void {
    this.loadDates();
    this.checkEventStatus();
    // Check every minute if events should be disabled
    this.checkInterval = setInterval(() => this.checkEventStatus(), 60000);
  }

  constructor() {
    // Prefer to use injected service in properties to avoid DI ordering issues
    // this.firestore.testConnection(); // Opens browser console with all data
  }

  ngOnDestroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  createEmptyDate(): EventDate {
    return {
      id: '',
      eventName: '',
      date: '',
      time: '',
      enabled: true
    };
  }

  loadDates(): void {
    // Load existing dates from Firestore
    this.firestore.getAllEvents().subscribe(events => {
      this.datesList = events.map(e => ({
        id: e.id,
        eventName: e.eventName ?? e.name ?? 'Evento',
        date: e.date ?? (e.eventDate ? new Date(e.eventDate.seconds ? e.eventDate.seconds * 1000 : e.eventDate).toISOString().split('T')[0] : ''),
        time: e.time ?? '',
        enabled: e.enabled ?? true
      } as EventDate));
      this.datesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.checkEventStatus();
    }, err => {
      console.error('Error loading events from Firestore:', err);
    });
  }

  checkEventStatus(): void {
    // Disable events 2 hours before their start time
    const now = new Date();
    
    this.datesList.forEach(event => {
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      const twoHoursBeforeEvent = new Date(eventDateTime.getTime() - 2 * 60 * 60 * 1000);
      
      // Disable if current time is within 2 hours before the event
      if (now >= twoHoursBeforeEvent && now < eventDateTime) {
        event.enabled = false;
      }
    });
  }

  openCreateForm(): void {
    this.currentDate = this.createEmptyDate();
    this.isEditing = false;
    this.showForm = true;
  }

  editDate(dateItem: EventDate): void {
    this.currentDate = { ...dateItem };
    this.isEditing = true;
    this.showForm = true;
  }

  saveDate(): void {
  if (this.isSaving) return;

  this.isSaving = true;

  const payload = {
    eventName: this.currentDate.eventName,
    date: this.currentDate.date,
    time: this.currentDate.time,
    enabled: this.currentDate.enabled
  };

  const request = this.isEditing
    ? this.firestore.updateEvent(this.currentDate.id, payload)
    : this.firestore.createEvent(payload);

  request
    .then(() => {
      this.showForm = false;
      this.currentDate = this.createEmptyDate();
      this.loadDates();
    })
    .catch(err => console.error('Error saving event:', err))
    .finally(() => {
      this.isSaving = false;
    });
}


  cancelForm(): void {
    this.showForm = false;
    this.currentDate = this.createEmptyDate();
  }

  deleteDate(id: string): void {
    if (confirm('¿Está seguro de que desea eliminar esta fecha?')) {
      this.firestore.deleteEvent(id).then(() => {
        this.datesList = this.datesList.filter(d => d.id !== id);
      }).catch(err => console.error('Error deleting event:', err));
    }
  }

  updateDateStatus(dateItem: EventDate): void {
    // Persist the enabled status change to Firestore
    this.firestore.updateEvent(dateItem.id, {
      enabled: dateItem.enabled
    }).catch(err => console.error('Error updating event status:', err));
  }
}
