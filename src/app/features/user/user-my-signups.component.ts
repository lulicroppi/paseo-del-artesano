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

interface UserSignup {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
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
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Listen for current user and load their inscriptions
    this.authService.currentUser$.subscribe(user => {
      if (user && (user as any).dni) {
        this.loadUserSignups((user as any).dni);
      } else {
        this.userSignups = [];
        this.filteredSignups = [];
      }
    });
  }

  async loadUserSignups(dni: number): Promise<void> {
    try {
      // One-shot read - fetch inscriptions once
      const inscriptions = await this.firestoreService.getUserInscriptions(String(dni));
      // Map Firestore inscriptions to UserSignup model
      this.userSignups = inscriptions.map((ins: any) => ({
        id: ins.id,
        eventId: ins.eventId?.toString() ?? (ins.idEvent ? String(ins.idEvent) : ''),
        eventName: ins.eventName ?? ins.nameShop ?? 'Evento',
        eventDate: ins.eventDate ? new Date(ins.eventDate.seconds ? ins.eventDate.seconds * 1000 : ins.eventDate).toISOString() : (ins.fecha ?? ''),
        time: ins.time ?? '',
        enabled: ins.enabled ?? true,
        status: ins.status ?? (ins.assisted ? 'attended' : 'confirmed'),
        registrationDate: ins.registrationDate ?? (ins.createdAt ?? new Date().toISOString())
      } as UserSignup));

      this.filterSignups();
    } catch (err) {
      console.error('Error loading user inscriptions:', err);
      this.userSignups = [];
      this.filteredSignups = [];
    }
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
        console.log(this.userSignups, this.filteredSignups);
  }

  cancelSignup(signup: UserSignup): void {
    if (!signup.enabled) {
      this.showMessage('No puedes cancelar un evento deshabilitado.', 'error');
      return;
    }
    // Delete inscription from Firestore
    this.firestoreService.deleteInscription(signup.id).then(() => {
      this.showMessage('Inscripción cancelada correctamente.', 'success');
      // refresh list
      const currentUser = this.authService.getCurrentUser();
      if (currentUser && (currentUser as any).dni) {
        this.loadUserSignups((currentUser as any).dni);
      }
    }).catch(err => {
      console.error('Error deleting inscription:', err);
      this.showMessage('Error al cancelar la inscripción.', 'error');
    });
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
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
}
