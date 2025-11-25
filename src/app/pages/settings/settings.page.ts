import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, 
  IonItem, IonLabel, IonIcon, IonCard, IonCardContent, 
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonAvatar,
  IonToggle, IonButton, IonSelect, IonSelectOption, IonInput,
  IonModal, AlertController, IonButtons, NavController, 
  IonSegment, IonSegmentButton 
} from '@ionic/angular/standalone';


import { addIcons } from 'ionicons';
import { 
  timeOutline, notificationsOutline, lockClosedOutline, 
  helpCircleOutline, personCircleOutline, medicalOutline, 
  arrowBack, settingsOutline, textOutline,
  chatbubbleOutline, playCircleOutline, mailOutline,
  callOutline,
  
  helpCircle,
  playCircle,
  mail,
  call,
  time,
  chatbubbles
} from 'ionicons/icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    IonSegmentButton, IonSegment, IonButtons, IonContent, IonHeader, IonTitle, 
    IonToolbar, IonList, IonItem, IonLabel, IonIcon, IonCard, IonCardContent, 
    IonCardHeader, IonCardTitle, IonCardSubtitle, IonAvatar, IonToggle, 
    IonButton, IonSelect, IonSelectOption, IonInput, IonModal, CommonModule, FormsModule
  ]
})
export class SettingsPage implements OnInit {

  role: string = 'paciente';

  // MÉDICO 
  doctorInfo = {
    name: '',
    specialty: 'Médico General',
    email: '',
    avatar: 'DR'
  };

  scheduleSettings = {
    days: [
      { name: 'Lunes', active: true, start: '08:00', end: '17:00' },
      { name: 'Martes', active: true, start: '08:00', end: '17:00' },
      { name: 'Miércoles', active: true, start: '08:00', end: '17:00' },
      { name: 'Jueves', active: true, start: '08:00', end: '17:00' },
      { name: 'Viernes', active: true, start: '08:00', end: '17:00' },
      { name: 'Sábado', active: false, start: '09:00', end: '13:00' },
      { name: 'Domingo', active: false, start: '09:00', end: '13:00' }
    ],
    appointmentDuration: '30'
  };

  notificationSettings = {
    newAppointments: true,
    appointmentReminders: true,
    messages: true,
    emailNotifications: false,
    pushNotifications: true
  };

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Modales del médico
  isScheduleModalOpen = false;
  isNotificationsModalOpen = false;
  isPasswordModalOpen = false;

  //PACIENTE
  patientSettings = {
    appointmentReminders: true,
    fontSize: 'mediana',
    language: 'es',
  };

  // Modales del paciente
  isPatientPasswordModalOpen = false;
  isPatientHelpModalOpen = false;

  // Datos para modales del paciente
  patientPasswordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private alertController: AlertController, 
    private navCtrl: NavController
  ) {
   
    addIcons({
      'arrow-back': arrowBack,
      'notifications-outline': notificationsOutline,
      'text-outline': textOutline,
      'lock-closed-outline': lockClosedOutline,
      'help-circle-outline': helpCircleOutline,
      'time-outline': timeOutline,
      'medical-outline': medicalOutline,
      'person-circle-outline': personCircleOutline,
      'settings-outline': settingsOutline,
      'chatbubble-outline': chatbubbleOutline,
      'play-circle-outline': playCircleOutline,
      'mail-outline': mailOutline,
      'call-outline': callOutline,
      'help-circle': helpCircle,
      'play-circle': playCircle,
      'chatbubbles': chatbubbles,
      'mail': mail,
      'call': call,
      'time': time
    });
  }

  ngOnInit() {
    console.log('Settings page initialized');
  }

  

  toggleDay(day: any) {
    day.active = !day.active;
  }

  saveSchedule() {
    console.log('Horario guardado:', this.scheduleSettings);
    this.isScheduleModalOpen = false;
    this.presentAlert('Éxito', 'Horario de atención actualizado correctamente.');
  }

  saveNotifications() {
    console.log('Notificaciones guardadas:', this.notificationSettings);
    this.isNotificationsModalOpen = false;
    this.presentAlert('Éxito', 'Configuración de notificaciones actualizada.');
  }

  async changePassword() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.presentAlert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    if (this.passwordData.newPassword.length < 6) {
      this.presentAlert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    console.log('Cambiando contraseña:', this.passwordData);
    this.isPasswordModalOpen = false;
    
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    this.presentAlert('Éxito', 'Contraseña cambiada correctamente.');
  }

  async openHelp() {
    const alert = await this.alertController.create({
      header: 'Ayuda y Soporte - Médico',
      message: 'Contacta a nuestro equipo de soporte en 495-123-4567 o por correo a soporte@telemedicina.com',
      buttons: ['Cerrar'],
      cssClass: 'help-alert'
    });

    await alert.present();
  }

  //  MÉTODOS PARA PACIENTE 

  openPatientPasswordModal() {
    this.isPatientPasswordModalOpen = true;
  }

  openPatientHelpModal() {
    this.isPatientHelpModalOpen = true;
  }

  async changePatientPassword() {
    if (this.patientPasswordData.newPassword !== this.patientPasswordData.confirmPassword) {
      this.presentAlert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    if (this.patientPasswordData.newPassword.length < 6) {
      this.presentAlert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    console.log('Cambiando contraseña del paciente:', this.patientPasswordData);
    this.isPatientPasswordModalOpen = false;
    
    this.patientPasswordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    this.presentAlert('Éxito', 'Contraseña cambiada correctamente.');
  }

  savePatientPreferences() {
    console.log('Preferencias del paciente guardadas:', this.patientSettings);
    this.presentAlert('Éxito', 'Preferencias actualizadas correctamente.');
  }

  async openPatientHelp() {
    const alert = await this.alertController.create({
      header: 'Ayuda y Soporte - Paciente',
      message: 'Contacta a nuestro equipo de soporte en 495-123-4567 o por correo a pacientes@virtualmed.com',
      buttons: ['Cerrar'],
      cssClass: 'help-alert'
    });

    await alert.present();
  }

  //  MÉTODOS COMPARTIDOS

  openScheduleModal() {
    this.isScheduleModalOpen = true;
  }

  openNotificationsModal() {
    this.isNotificationsModalOpen = true;
  }

  openPasswordModal() {
    this.isPasswordModalOpen = true;
  }

  closeModals() {
    this.isScheduleModalOpen = false;
    this.isNotificationsModalOpen = false;
    this.isPasswordModalOpen = false;
    this.isPatientPasswordModalOpen = false;
    this.isPatientHelpModalOpen = false;
  }

  goBack() {
    if (this.isScheduleModalOpen || this.isNotificationsModalOpen || this.isPasswordModalOpen ||
        this.isPatientPasswordModalOpen || this.isPatientHelpModalOpen) {
      this.closeModals();
    } else {
      this.navCtrl.back();
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }
}