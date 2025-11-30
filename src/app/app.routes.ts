import { Routes } from '@angular/router';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
  },
  {
    path: 'create-appointment',
    loadComponent: () => import('./pages/create-appointment/create-appointment.page').then(m => m.CreateAppointmentPage),
  },
  {
    path: 'my-appointments',
    loadComponent: () => import('./pages/my-appointments/my-appointments.page').then(m => m.MyAppointmentsPage),
  },
  {
    path: 'prescription',
    loadComponent: () => import('./pages/prescription/prescription.page').then(m => m.PrescriptionPage),
  },
  {
    path: 'medical-records',
    loadComponent: () => import('./pages/medical-records/medical-records.page').then(m => m.MedicalRecordsPage),
  },
  {
    path: 'management',
    loadComponent: () => import('./pages/management/management.page').then(m => m.ManagementPage),
  },
  {
    path: 'schedule-for-doctor',
    loadComponent: () => import('./pages/schedule-for-doctor/schedule-for-doctor.page').then(m => m.ScheduleForDoctorPage),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'chatbot',
    loadComponent: () => import('./pages/chatbot/chatbot.page').then( m => m.ChatbotPage),
    canActivate: [AuthGuard] 
  },
  {
    path: '**',
    redirectTo: 'login'
  },
  {
    path: 'doctor-profile',
    loadComponent: () => import('./pages/doctor-profile/doctor-profile.page').then( m => m.DoctorProfilePage)
  }

];