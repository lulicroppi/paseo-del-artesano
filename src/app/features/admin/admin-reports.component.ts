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
    this.generateReports();
  }

  loadEvents(): void {
    // Load events from admin-dates
    const allEvents: Event[] = [
      { id: '1', eventName: 'Workshop Angular', date: '2025-01-15', time: '10:00', enabled: true },
      { id: '2', eventName: 'Artisan Fair', date: '2025-01-20', time: '09:00', enabled: true },
      { id: '3', eventName: 'Crafts Exhibition', date: '2025-02-01', time: '11:00', enabled: false }
    ];
    this.events = allEvents.filter(e => e.enabled);
  }

  loadAttendees(): void {
    // Load sample attendees data
    this.attendees = [
      { id: '1', name: 'Juan García', emprendimiento: 'Cerámica Artesanal', eventId: '1', status: 'Asistio' },
      { id: '2', name: 'María López', emprendimiento: 'Textiles Andinos', eventId: '1', status: 'Asistio' },
      { id: '3', name: 'Carlos Ruiz', emprendimiento: 'Joyería Tradicional', eventId: '1', status: 'No asistio' },
      { id: '4', name: 'Ana Martínez', emprendimiento: 'Artesanía en Madera', eventId: '1', status: 'Anotado' },
      { id: '5', name: 'Pedro Sánchez', emprendimiento: 'Productos Orgánicos', eventId: '2', status: 'Asistio' },
      { id: '6', name: 'Laura García', emprendimiento: 'Bordados Étnicos', eventId: '2', status: 'Asistio' },
      { id: '7', name: 'Roberto López', emprendimiento: 'Trabajos en Cuero', eventId: '2', status: 'No asistio' }
    ];
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
        totalAttendees: attendeesForEvent.length,
        attended: attended,
        absent: absent
      });
    });
    
    this.attendancePerDay = Array.from(grouped.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  generateEmprendimientoStats(): void {
    const statsMap = new Map<string, EmprendimientoStats>();
    
    this.attendees.forEach(attendee => {
      if (!statsMap.has(attendee.emprendimiento)) {
        statsMap.set(attendee.emprendimiento, {
          emprendimiento: attendee.emprendimiento,
          attended: 0,
          absent: 0,
          registered: 0
        });
      }
      
      const stats = statsMap.get(attendee.emprendimiento)!;
      stats.registered++;
      if (attendee.status === 'Asistio') {
        stats.attended++;
      } else if (attendee.status === 'No asistio') {
        stats.absent++;
      }
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

  exportToCSV(): void {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (this.selectedReport === 'attendees-per-day') {
      csvContent += 'Fecha,Total Asistentes,Asistieron,Ausentes\n';
      this.attendancePerDay.forEach(row => {
        csvContent += `${row.date},${row.totalAttendees},${row.attended},${row.absent}\n`;
      });
    } else if (this.selectedReport === 'emprendimiento-stats') {
      csvContent += 'Emprendimiento,Asistieron,Ausentes,Registrados\n';
      this.emprendimientoStats.forEach(row => {
        csvContent += `${row.emprendimiento},${row.attended},${row.absent},${row.registered}\n`;
      });
    }
    
    this.downloadFile(csvContent, 'reporte.csv');
  }

  exportToPDF(): void {
    // Simple PDF export - creates a formatted text file that can be printed as PDF
    let pdfContent = 'REPORTE DE EVENTOS - PASEO DEL ARTESANO\n\n';
    pdfContent += `Fecha de generación: ${new Date().toLocaleDateString('es-ES')}\n\n`;
    
    if (this.selectedReport === 'attendees-per-day') {
      pdfContent += '=== ASISTENCIA POR DÍA ===\n\n';
      this.attendancePerDay.forEach(row => {
        pdfContent += `Fecha: ${row.date}\n`;
        pdfContent += `  Total Asistentes: ${row.totalAttendees}\n`;
        pdfContent += `  Asistieron: ${row.attended}\n`;
        pdfContent += `  Ausentes: ${row.absent}\n\n`;
      });
    } else if (this.selectedReport === 'emprendimiento-stats') {
      pdfContent += '=== ESTADÍSTICAS POR EMPRENDIMIENTO ===\n\n';
      this.emprendimientoStats.forEach(row => {
        pdfContent += `${row.emprendimiento}\n`;
        pdfContent += `  Asistieron: ${row.attended}\n`;
        pdfContent += `  Ausentes: ${row.absent}\n`;
        pdfContent += `  Registrados: ${row.registered}\n\n`;
      });
    }
    
    const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(pdfContent);
    this.downloadFile(dataUri, 'reporte.txt');
  }

  private downloadFile(dataUri: string, filename: string): void {
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', filename);
    link.click();
  }

  getAttendanceRate(stats: EmprendimientoStats): number {
    if (stats.registered === 0) return 0;
    return Math.round((stats.attended / stats.registered) * 100);
  }
}
