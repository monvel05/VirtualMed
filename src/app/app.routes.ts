import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then( m => m.DashboardPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'create-appointment',
    loadComponent: () => import('./pages/create-appointment/create-appointment.page').then( m => m.CreateAppointmentPage)
  },
  {
    path: 'my-appointments',
    loadComponent: () => import('./pages/my-appointments/my-appointments.page').then( m => m.MyAppointmentsPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then( m => m.SettingsPage)
  },
  {
    path: 'prescription',
    loadComponent: () => import('./pages/prescription/prescription.page').then( m => m.PrescriptionPage)
  },
  {
    path: 'management',
    loadComponent: () => import('./pages/management/management.page').then( m => m.ManagementPage)
  },
];
