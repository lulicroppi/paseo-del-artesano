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

interface AttendancePerDay {
  date: string;
  totalAttendees: number;
  attended: number;
  absent: number;
}

interface EmprendimientoStats {
  emprendimiento: string;
  attended: number;
  absent: number;
  registered: number;
}

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reports.component.html',
  styleUrl: './admin-reports.component.scss'
})
export class AdminReportsComponent implements OnInit {

  private firestore = inject(FirestoreService);

  events: Event[] = [];
  attendees: Attendee[] = [];
  selectedReport: string = 'attendees-per-day';

  attendancePerDay: AttendancePerDay[] = [];
  emprendimientoStats: EmprendimientoStats[] = [];
  topAssistance: EmprendimientoStats[] = [];
  topAbsence: EmprendimientoStats[] = [];

  ngOnInit(): void {
    this.loadEvents();
    this.loadAttendees();
  }

  loadEvents(): void {
    this.firestore.getAllEvents().subscribe(events => {
      this.events = (events ?? [])
        .map((e: any) => ({
          id: String(e.id ?? ''),
          eventName: e.eventName ?? e.name ?? '',
          date: e.date ?? '',
          time: e.time ?? '',
          enabled: e.enabled ?? true
        }))
        .filter((e: any) => e.enabled);

      this.generateReports();
    });
  }

  loadAttendees(): void {
    this.firestore.getAllInscriptions().subscribe(inscriptions => {
      this.attendees = (inscriptions ?? []).map((ins: any) => ({
        id: String(ins.id ?? ''),
        name: ins.name ?? ins.nameLastName ?? ins.userName ?? 'Participante',
        emprendimiento: (ins.nameShop ?? ins.emprendimiento ?? '').trim(),
        eventId: ins.eventId?.toString() ?? (ins.idEvent ? String(ins.idEvent) : ''),
        status:
          ins.status === 'Asistio' || ins.assisted
            ? 'Asistio'
            : (ins.status === 'No asistio' ? 'No asistio' : 'Anotado')
      } as Attendee));

      this.generateReports();
    });
  }

  generateReports(): void {
    this.generateAttendancePerDay();
    this.generateEmprendimientoStats();
    this.generateTopPerformers();
  }

  generateAttendancePerDay(): void {
    const grouped = new Map<string, AttendancePerDay>();

    this.events.forEach(event => {
      const attendeesForEvent = this.attendees.filter(a => a.eventId === event.id);
      const attended = attendeesForEvent.filter(a => a.status === 'Asistio').length;
      const absent = attendeesForEvent.filter(a => a.status === 'No asistio').length;

      grouped.set(event.date, {
        date: event.date,
        totalAttendees: attendeesForEvent.length || 0,
        attended,
        absent
      });
    });

    this.attendancePerDay = Array.from(grouped.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  generateEmprendimientoStats(): void {
    const statsMap = new Map<string, EmprendimientoStats>();

    this.attendees.forEach(attendee => {
      const emprendimiento = (attendee.emprendimiento ?? '').trim();
      if (!emprendimiento) return;

      if (!statsMap.has(emprendimiento)) {
        statsMap.set(emprendimiento, {
          emprendimiento,
          attended: 0,
          absent: 0,
          registered: 0
        });
      }

      const stats = statsMap.get(emprendimiento)!;
      stats.registered++;

      if (attendee.status === 'Asistio') stats.attended++;
      else if (attendee.status === 'No asistio') stats.absent++;
    });

    this.emprendimientoStats = Array.from(statsMap.values())
      .sort((a, b) => b.registered - a.registered);
  }

  generateTopPerformers(): void {
    this.topAssistance = [...this.emprendimientoStats]
      .sort((a, b) => b.attended - a.attended)
      .slice(0, 5);

    this.topAbsence = [...this.emprendimientoStats]
      .sort((a, b) => b.absent - a.absent)
      .slice(0, 5);
  }

  onReportChange(): void {
    // Report data is already generated
  }

  getAttendanceRate(stats: EmprendimientoStats): number {
    if (stats.registered === 0) return 0;
    return Math.round((stats.attended / stats.registered) * 100);
  }

  getDayAttendancePercent(day: AttendancePerDay): number {
    const total = Number(day?.totalAttendees ?? 0);
    const attended = Number(day?.attended ?? 0);

    if (!total || total <= 0) return 0;

    return Math.round((attended / total) * 100);
  }
}
