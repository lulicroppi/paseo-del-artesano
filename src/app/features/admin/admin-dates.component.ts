import { Component, OnInit, OnDestroy } from '@angular/core';
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
  currentDate: EventDate = this.createEmptyDate();
  private checkInterval: any;

  ngOnInit(): void {
    this.loadDates();
    this.checkEventStatus();
    // Check every minute if events should be disabled
    this.checkInterval = setInterval(() => this.checkEventStatus(), 60000);
  }

  constructor(private firestore: FirestoreService) {
  this.firestore.testConnection(); // Opens browser console with all data
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
    // Load existing dates from storage or API
    this.datesList = [
      { id: '1', eventName: 'Workshop Angular', date: '2025-01-15', time: '10:00', enabled: true },
      { id: '2', eventName: 'Artisan Fair', date: '2025-01-20', time: '09:00', enabled: true },
      { id: '3', eventName: 'Crafts Exhibition', date: '2025-02-01', time: '11:00', enabled: false }
    ];
    this.checkEventStatus();
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
    if (this.isEditing) {
      const index = this.datesList.findIndex(d => d.id === this.currentDate.id);
      if (index > -1) {
        this.datesList[index] = this.currentDate;
      }
    } else {
      this.currentDate.id = Date.now().toString();
      this.datesList.push(this.currentDate);
    }
    this.showForm = false;
    this.currentDate = this.createEmptyDate();
    this.checkEventStatus();
  }

  cancelForm(): void {
    this.showForm = false;
    this.currentDate = this.createEmptyDate();
  }

  deleteDate(id: string): void {
    if (confirm('¿Está seguro de que desea eliminar esta fecha?')) {
      this.datesList = this.datesList.filter(d => d.id !== id);
    }
  }
}
