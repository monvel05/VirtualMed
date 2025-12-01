import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, 
  IonItem, IonLabel, IonIcon, IonCard, IonCardContent, 
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonAvatar,
  IonToggle, IonButton, IonSelect, IonSelectOption, IonInput,
  IonModal, AlertController, IonButtons, NavController, 
  IonSegment, IonSegmentButton, IonRippleEffect 
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { 
  timeOutline, notificationsOutline, lockClosedOutline, 
  helpCircleOutline, personCircleOutline, medicalOutline, 
  arrowBack, settingsOutline, textOutline,
  chatbubbleOutline, playCircleOutline, mailOutline,
  callOutline, helpCircle, playCircle, chatbubbles,
  chevronForwardOutline, saveOutline
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
    IonButton, IonSelect, IonSelectOption, IonInput, IonModal, CommonModule, FormsModule,
    IonRippleEffect 
  ]
})
export class SettingsPage implements OnInit {

  role: string = 'paciente';

  // --- VARIABLES PREVIEW PACIENTE ---
  patientPreview = {
    nombre: 'Cargando...',
    email: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg'
  };

  // Variables de configuración de PACIENTE
  patientSettings = {
    appointmentReminders: true,
    fontSize: 'mediana',
    language: 'es',
  };

  // Modales Paciente
  isPatientPasswordModalOpen = false;
  isPatientHelpModalOpen = false;
  
  patientPasswordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // --- VARIABLES MÉDICO ---
  doctorInfo = {
    name: 'Dr. Ejemplo',
    specialty: 'Médico General',
    email: 'doc@test.com',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg'
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

  // Modales Médico
  isScheduleModalOpen = false;
  isNotificationsModalOpen = false;
  isPasswordModalOpen = false;

  constructor(
    private alertController: AlertController, 
    private navCtrl: NavController,
    private userService: UserService 
  ) {
    addIcons({arrowBack,chevronForwardOutline,notificationsOutline,textOutline,lockClosedOutline,helpCircleOutline,saveOutline,timeOutline,mailOutline,medicalOutline,helpCircle,chatbubbles,playCircle,personCircleOutline,settingsOutline,chatbubbleOutline,playCircleOutline,callOutline});
  }

  ngOnInit() {
    this.determinarRolUsuario();
  }

  // Determina si el usuario es paciente o médico
  determinarRolUsuario() {
    const userRole = this.userService.getRole();
    
    if (userRole === 'medico' || userRole === 'doctor') {
      this.role = 'medico';
    } else {
      this.role = 'paciente';
    }
  }

  // Se ejecuta cada vez que entras a la pantalla
  ionViewWillEnter() {
    this.determinarRolUsuario();
    
    if (this.role === 'paciente') {
      this.cargarPreviewPaciente();
    } else if (this.role === 'medico') {
      this.cargarPreviewMedico();
    }
  }

  // --- LÓGICA PACIENTE ---
  cargarPreviewPaciente() {
    const myId = this.userService.getId();
    
    if (!myId) {
      this.patientPreview.nombre = 'Invitado';
      this.patientPreview.avatar = 'https://ui-avatars.com/api/?name=Invitado&background=random';
      return;
    }
    
    this.userService.getUserById(myId).subscribe({
      next: (res: any) => {
        if (res && res.user) {
          const fullName = res.user.nombre + ' ' + (res.user.apellido || res.user.apellidos || '');
          this.patientPreview.nombre = fullName;
          this.patientPreview.email = res.user.email;
          
          let imgUrl = res.user.profileImage;

          if (imgUrl && typeof imgUrl === 'string' && imgUrl.length > 10) {
            imgUrl = imgUrl.replace(/['"]+/g, '').trim();
            
            if (imgUrl.startsWith('http:')) {
              imgUrl = imgUrl.replace('http:', 'https:');
            }
            
            this.testImageLoad(imgUrl).then(success => {
              if (success) {
                this.patientPreview.avatar = imgUrl;
              } else {
                this.patientPreview.avatar = `https://ui-avatars.com/api/?name=${fullName}&background=0D8ECF&color=fff&size=128`;
              }
            });
            
          } else {
            this.patientPreview.avatar = `https://ui-avatars.com/api/?name=${fullName}&background=0D8ECF&color=fff&size=128`;
          }
        } else {
          this.patientPreview.nombre = 'Usuario';
        }
      },
      error: (error: any) => {
        this.patientPreview.nombre = 'Usuario (Offline)';
        this.patientPreview.avatar = 'https://ui-avatars.com/api/?name=User&background=gray&color=fff';
      }
    });
  }

  // --- LÓGICA MÉDICO ---
  cargarPreviewMedico() {
    const doctorId = this.userService.getId();
    
    if (!doctorId) {
      this.doctorInfo.name = 'Médico';
      this.doctorInfo.avatar = 'https://ui-avatars.com/api/?name=Medico&background=random';
      return;
    }
    
    this.userService.getUserById(doctorId).subscribe({
      next: (res: any) => {
        if (res && res.user) {
          const fullName = 'Dr. ' + (res.user.nombre || '') + ' ' + (res.user.apellido || res.user.apellidos || '');
          const specialty = res.user.especialidad || 'Médico General';
          
          this.doctorInfo.name = fullName;
          this.doctorInfo.specialty = specialty;
          this.doctorInfo.email = res.user.email || '';
          
          let imgUrl = res.user.profileImage;

          if (imgUrl && typeof imgUrl === 'string' && imgUrl.length > 10) {
            imgUrl = imgUrl.replace(/['"]+/g, '').trim();
            
            if (imgUrl.startsWith('http:')) {
              imgUrl = imgUrl.replace('http:', 'https:');
            }
            
            this.testImageLoad(imgUrl).then(success => {
              if (success) {
                this.doctorInfo.avatar = imgUrl;
              } else {
                const nameForAvatar = fullName.replace('Dr. ', '').replace('Dra. ', '');
                this.doctorInfo.avatar = `https://ui-avatars.com/api/?name=${nameForAvatar}&background=0D8ECF&color=fff&size=128`;
              }
            });
            
          } else {
            const nameForAvatar = fullName.replace('Dr. ', '').replace('Dra. ', '');
            this.doctorInfo.avatar = `https://ui-avatars.com/api/?name=${nameForAvatar}&background=0D8ECF&color=fff&size=128`;
          }
        }
      },
      error: (error: any) => {
        this.doctorInfo.name = 'Médico (Offline)';
        this.doctorInfo.avatar = 'https://ui-avatars.com/api/?name=Medico&background=gray&color=fff';
      }
    });
  }

  // Método para testear si la imagen se puede cargar
  private testImageLoad(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      setTimeout(() => {
        if (!img.complete) {
          resolve(false);
        }
      }, 5000);
    });
  }

  // Manejo de errores de imagen
  onImageError(event: any, type: 'patient' | 'doctor') {
    const fallbackUrl = 'https://ionicframework.com/docs/img/demos/avatar.svg';
    event.target.src = fallbackUrl;
    event.target.onerror = null;
    
    if (type === 'patient') {
      const fullName = this.patientPreview.nombre;
      this.patientPreview.avatar = `https://ui-avatars.com/api/?name=${fullName}&background=0D8ECF&color=fff&size=128`;
    } else {
      const nameForAvatar = this.doctorInfo.name.replace('Dr. ', '').replace('Dra. ', '');
      this.doctorInfo.avatar = `https://ui-avatars.com/api/?name=${nameForAvatar}&background=0D8ECF&color=fff&size=128`;
    }
  }

  goToProfilePage() {
    this.navCtrl.navigateForward('/profile'); 
  }

  // Manejar cambio de segmento
  onSegmentChange(event: any) {
    this.role = event.detail.value;
    
    if (this.role === 'paciente') {
      this.cargarPreviewPaciente();
    } else if (this.role === 'medico') {
      this.cargarPreviewMedico();
    }
  }

  // --- MÉTODOS DE LA UI ---
  toggleDay(day: any) { 
    day.active = !day.active; 
  }

  saveSchedule() {
    this.isScheduleModalOpen = false;
    this.presentAlert('Éxito', 'Horario actualizado.');
  }

  saveNotifications() {
    this.isNotificationsModalOpen = false;
    this.presentAlert('Éxito', 'Notificaciones actualizadas.');
  }

  async changePassword() {
    this.isPasswordModalOpen = false;
    this.presentAlert('Éxito', 'Contraseña cambiada.');
  }

  // Métodos Paciente
  openPatientPasswordModal() { 
    this.isPatientPasswordModalOpen = true; 
  }
  
  openPatientHelpModal() { 
    this.isPatientHelpModalOpen = true; 
  }
  
  async changePatientPassword() {
    this.isPatientPasswordModalOpen = false;
    this.presentAlert('Éxito', 'Contraseña cambiada.');
  }

  savePatientPreferences() {
    this.presentAlert('Éxito', 'Preferencias actualizadas.');
  }

  // Modales compartidos
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
  
  async openHelp() { 
    this.presentAlert('Ayuda', 'Contacta a soporte.'); 
  }
}