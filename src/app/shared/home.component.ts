import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/user.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AdminDatesComponent } from '../features/admin/admin-dates.component';
import { AdminReportsComponent } from '../features/admin/admin-reports.component';
import { AdminAttendanceComponent } from '../features/admin/admin-attendance.component';
import { UserSignupComponent } from '../features/user/user-signup.component';
import { UserMySignupsComponent } from '../features/user/user-my-signups.component';

interface TabItem {
  label: string;
  value: string;
  component: any;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    AdminDatesComponent,
    AdminReportsComponent,
    AdminAttendanceComponent,
    UserSignupComponent,
    UserMySignupsComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  router = inject(Router);
  
  currentUser: User | null = null;
  selectedTab: string = '';
  tabs: TabItem[] = [];
  private destroy$ = new Subject<void>();

  // Admin tabs
  private adminTabs: TabItem[] = [
    { label: 'Fechas', value: 'dates', component: AdminDatesComponent },
    { label: 'Reportes', value: 'reports', component: AdminReportsComponent },
    { label: 'Asistencia', value: 'attendance', component: AdminAttendanceComponent }
  ];

  // User tabs
  private userTabs: TabItem[] = [
    { label: 'Inscribirse', value: 'signup', component: UserSignupComponent },
    { label: 'Mis Inscripciones', value: 'my-signups', component: UserMySignupsComponent }
  ];

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: User | null) => {
        this.currentUser = user;
        
        // Set tabs based on user role
        if (user?.isAdmin) {
          this.tabs = this.adminTabs;
        } else {
          this.tabs = this.userTabs;
        }

        // Select first tab by default
        if (this.tabs.length > 0 && !this.selectedTab) {
          this.selectedTab = this.tabs[0].value;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectTab(tabValue: string): void {
    this.selectedTab = tabValue;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getComponentForTab(tabValue: string): any {
    const tab = this.tabs.find(t => t.value === tabValue);
    return tab?.component;
  }
}
