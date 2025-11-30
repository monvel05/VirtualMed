import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// IMPORTANTE: Importamos la CLASE UserService, no la interfaz User
import { UserService } from '../../services/user.service';

// Ionic Components & Icons
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenu,
  IonMenuButton, IonGrid, IonDatetime, IonCol, IonRow, IonAccordion,
  IonAccordionGroup, IonItem, IonLabel, IonCard, IonCardContent,
  IonCardHeader, IonCardSubtitle, IonCardTitle, IonFab, IonFabButton,
  IonFabList, IonIcon, IonModal, IonButton, IonList 
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { 
  personCircleOutline, settingsOutline, logOutOutline, chevronUpCircle, 
  alert, notifications, settings, chatbubbles 
} from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  // CORRECCIÓN 1: Agregar CommonModule y FormsModule aquí, y limpiar duplicados
  imports: [
    CommonModule, FormsModule, IonButtons, IonDatetime,
    IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar,
    IonGrid, IonCol, IonRow, IonAccordion, IonAccordionGroup,
    IonItem, IonLabel, IonCard, IonCardContent, IonCardHeader,
    IonCardSubtitle, IonCardTitle, IonFab, IonFabButton, IonFabList,
    IonIcon, IonModal, IonButton, IonMenu, IonList
  ],
})
export class DashboardPage implements OnInit {
  role = '';
  greeting: string = '';
  isModalOpen = false;

  constructor(
    private router: Router, 
    private userService: UserService // <--- Inyectamos el servicio correctamente
  ) {
    addIcons({personCircleOutline,settingsOutline,logOutOutline,chevronUpCircle,chatbubbles,settings,notifications,alert});
  }

  ngOnInit() {
    // Usamos el servicio para obtener los datos
    this.role = this.userService.getRole();
    this.getGreeting();
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  getGreeting() {
    const time = new Date();
    const hour = time.getHours();
    // Obtenemos el nombre del servicio
    const name = this.userService.getName();

    if (hour < 12) {
      this.greeting = '¡Buenos días ' + name + '!';
    } else if (hour < 18) {
      this.greeting = '¡Buenas tardes ' + name + '!';
    } else {
      this.greeting = '¡Buenas noches ' + name + '!';
    }
  }

  highlightedDates = [
    { date: '2025-11-10', textColor: '#800080', backgroundColor: '#ffc0cb', border: '1px solid #e91e63' },
    { date: '2025-11-02', textColor: '#09721b', backgroundColor: '#c8e5d0', border: '1px solid #4caf50' },
    { date: '2025-11-15', textColor: 'var(--ion-color-secondary)', backgroundColor: 'rgb(var(--ion-color-secondary-rgb), 0.18)', border: '1px solid var(--ion-color-secondary-shade)' },
    { date: '2025-11-22', textColor: 'rgb(68, 10, 184)', backgroundColor: 'rgb(211, 200, 229)', border: '1px solid rgb(103, 58, 183)' },
  ];

  dates = [
    { date: '2025-11-10', hour: '10:00 AM', description: 'Cita con el paciente Juan Pérez' },
    { date: '2025-11-15', hour: '02:00 PM', description: 'Cita con la paciente María López' },
  ];

  // Funciones para navegación
  fnGoToCreateAppointment() { this.router.navigate(['/create-appointment']); }
  fnGoToManagement() { this.router.navigate(['/management']); }
  fnGoToMedicalRecords() { this.router.navigate(['/medical-records']); }
  fnGoToPrescription() { this.router.navigate(['/prescription']); }
  fnGoToProfile() { this.router.navigate(['/profile']); }
  fnGoToSettings() { this.router.navigate(['/settings']); }
  fnGoToHome() { this.router.navigate(['/dashboard']); }
  fnGoToChatbot() { this.router.navigate(['/chatbot']); }

  fnLogout() {
    // El servicio se encarga de limpiar datos y redirigir
    this.userService.logout();
  }
}