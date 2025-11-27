// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  chevronUpCircle, 
  alert, 
  settings, 
  notifications,
  eyeOutline,
  eyeOffOutline,
  cameraOutline,
  checkmarkCircle,
  logOutOutline,
  personOutline,
  medkitOutline,
  calendarOutline,
  documentOutline,
  peopleOutline,
  statsChartOutline,
  medicalOutline,
  homeOutline,
  menuOutline,
  closeOutline,
  searchOutline,
  addOutline,
  trashOutline,
  createOutline,
  timeOutline,
  locationOutline,
  callOutline,
  mailOutline,
  heartOutline,
  warningOutline,
  informationCircleOutline,
  ellipsisHorizontalOutline,
  arrowBackOutline,
  saveOutline,
  downloadOutline,
  shareOutline,
  printOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, IonicModule],
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `
})
export class AppComponent {
  title = 'VirtualMed';

  constructor() {
    // Registrar todos los iconos que usa la aplicación
    addIcons({
      chevronUpCircle,
      alert,
      settings,
      notifications,
      eyeOutline,
      eyeOffOutline,
      cameraOutline,
      checkmarkCircle,
      logOutOutline,
      personOutline,
      medkitOutline,
      calendarOutline,
      documentOutline,
      peopleOutline,
      statsChartOutline,
      medicalOutline,
      homeOutline,
      menuOutline,
      closeOutline,
      searchOutline,
      addOutline,
      trashOutline,
      createOutline,
      timeOutline,
      locationOutline,
      callOutline,
      mailOutline,
      heartOutline,
      warningOutline,
      informationCircleOutline,
      ellipsisHorizontalOutline,
      arrowBackOutline,
      saveOutline,
      downloadOutline,
      shareOutline,
      printOutline
    });
  }
}