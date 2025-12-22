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

interface UserSignup {
  id: string;
  eventId: string;
  eventName: string;
  date: string;
  time: string;
  enabled: boolean;
  status: 'confirmed' | 'pending' | 'attended';
  registrationDate: string;
}

@Component({
  selector: 'app-user-my-signups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-my-signups.component.html',
  styleUrl: './user-my-signups.component.scss'
})
export class UserMySignupsComponent implements OnInit {
  userSignups: UserSignup[] = [];
  filteredSignups: UserSignup[] = [];
  selectedFilter: string = 'all';
  message: string = '';
  messageType: 'success' | 'error' = 'success';

  ngOnInit(): void {
    this.loadUserSignups();
  }

  loadUserSignups(): void {
    // Load user's registered events
    const allEvents: Event[] = [
      { id: '1', eventName: 'Workshop Angular', date: '2025-01-15', time: '10:00', enabled: true },
      { id: '2', eventName: 'Artisan Fair', date: '2025-01-20', time: '09:00', enabled: true },
      { id: '3', eventName: 'Crafts Exhibition', date: '2025-02-01', time: '11:00', enabled: false }
    ];

    // Sample user signups - user is registered for all events
    this.userSignups = [
      {
        id: '1',
        eventId: '1',
        eventName: 'Workshop Angular',
        date: '2025-01-15',
        time: '10:00',
        enabled: true,
        status: 'confirmed',
        registrationDate: '2024-12-15'
      },
      {
        id: '2',
        eventId: '2',
        eventName: 'Artisan Fair',
        date: '2025-01-20',
        time: '09:00',
        enabled: true,
        status: 'pending',
        registrationDate: '2024-12-18'
      },
      {
        id: '3',
        eventId: '3',
        eventName: 'Crafts Exhibition',
        date: '2025-02-01',
        time: '11:00',
        enabled: false,
        status: 'attended',
        registrationDate: '2024-11-20'
      }
    ];

    this.filterSignups();
  }

  filterSignups(): void {
    switch (this.selectedFilter) {
      case 'enabled':
        this.filteredSignups = this.userSignups.filter(s => s.enabled);
        break;
      case 'disabled':
        this.filteredSignups = this.userSignups.filter(s => !s.enabled);
        break;
      case 'confirmed':
        this.filteredSignups = this.userSignups.filter(s => s.status === 'confirmed');
        break;
      case 'pending':
        this.filteredSignups = this.userSignups.filter(s => s.status === 'pending');
        break;
      case 'attended':
        this.filteredSignups = this.userSignups.filter(s => s.status === 'attended');
        break;
      default:
        this.filteredSignups = [...this.userSignups].sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
    }
  }

  onFilterChange(): void {
    this.filterSignups();
  }

  cancelSignup(signup: UserSignup): void {
    if (!signup.enabled) {
      this.showMessage('No puedes cancelar un evento deshabilitado.', 'error');
      return;
    }

    const index = this.userSignups.findIndex(s => s.id === signup.id);
    if (index > -1) {
      this.userSignups.splice(index, 1);
      this.filterSignups();
      this.showMessage('Inscripción cancelada correctamente.', 'success');
    }
  }

  showMessage(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'confirmed';
      case 'pending':
        return 'pending';
      case 'attended':
        return 'attended';
      default:
        return 'pending';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
