import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, 
  IonButtons, IonCardSubtitle, IonCardTitle, IonCardHeader, 
  IonCardContent, IonCard, IonItem, IonLabel, IonButton, 
  IonBadge, IonGrid, IonCol, IonRow, IonIcon, IonList, 
  IonText, IonSpinner, IonAlert, ToastController 
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ApiService } from '../../services/api.service';

interface Cita {
  id: string;
  tipo: string;
  fechahoraCita: string;
  doctor: string;
  especialidad: string;
  estatus?: string; // 👈 AÑADE ESTE CAMPO
  motivo?: string;
  notas?: string;
}

@Component({
  selector: 'app-my-appointments',
  templateUrl: './my-appointments.page.html',
  styleUrls: ['./my-appointments.page.scss'],
  standalone: true,
  imports: [
    IonSpinner, IonAlert, 
    IonText, IonList, IonIcon, IonRow, IonCol, IonGrid, 
    IonBadge, IonButton, IonLabel, IonItem, IonCard, 
    IonCardContent, IonCardHeader, IonCardTitle, 
    IonCardSubtitle, IonButtons, IonBackButton, 
    IonContent, IonHeader, IonTitle, IonToolbar, 
    CommonModule, FormsModule
  ]
})
export class MyAppointmentsPage implements OnInit {

  allAppointments: Cita[] = [];
  isLoading: boolean = true;
  isCancelling: boolean = false;
  showCancelAlert: boolean = false;
  selectedCitaId: string | null = null;

  constructor(
    private router: Router,
    private userService: UserService,
    private apiService: ApiService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.cargarCitas();
  }

  cargarCitas() {
    this.isLoading = true;
    const myId = this.userService.getId();

    if (!myId) {
      console.error('No hay usuario logueado');
      this.presentToast('Usuario no autenticado', 'danger');
      this.isLoading = false;
      this.allAppointments = [];
      return;
    }

    this.userService.getCitasByUser(myId).subscribe({
      next: (res: any) => {
        console.log('Respuesta de citas:', res);
        
        if (res && res.arrCitas && Array.isArray(res.arrCitas)) {
          this.allAppointments = res.arrCitas.map((cita: any) => ({
            id: cita.id || cita._id || '',
            tipo: cita.tipoCita || cita.tipo || 'Consulta',
            fechahoraCita: cita.fechahoraCita || cita.fecha || cita.fechaHora || '',
            doctor: cita.nombreDoctor || cita.doctorNombre || 
                   cita.doctor?.nombre || 'Dr. No especificado',
            especialidad: cita.especialidad || 
                         cita.doctor?.especialidad || 'General',
            estatus: cita.estatus || 'Pendiente', // 👈 Maneja el estado
            motivo: cita.motivo || '',
            notas: cita.notas || ''
          }));
          
          // Ordenar por fecha (más recientes primero)
          this.allAppointments.sort((a, b) => 
            new Date(b.fechahoraCita).getTime() - new Date(a.fechahoraCita).getTime()
          );
          
          this.presentToast(`${this.allAppointments.length} citas cargadas`, 'success');
        } else {
          this.allAppointments = [];
          this.presentToast('No tienes citas programadas', 'warning');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando citas:', err);
        this.presentToast('Error al cargar citas', 'danger');
        this.allAppointments = [];
        this.isLoading = false;
      }
    });
  }

  formatearFechaHora(fechahora: string): string {
    if (!fechahora) return 'Fecha no definida';

    try {
      const fecha = new Date(fechahora);
      if (isNaN(fecha.getTime())) return 'Fecha inválida';
      
      return fecha.toLocaleString('es-ES', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  getEstadoBadgeColor(estatus: string = ''): string {
    const status = estatus.toLowerCase();
    switch(status) {
      case 'confirmada': return 'success';
      case 'pendiente': return 'warning';
      case 'cancelada': return 'danger';
      case 'completada': return 'primary';
      default: return 'medium';
    }
  }

  // Método para abrir alerta de cancelación
  abrirConfirmacionCancelacion(cita: Cita) {
    this.selectedCitaId = cita.id;
    this.showCancelAlert = true;
  }

  // Método que se ejecuta al confirmar cancelación
  cancelarCitaConfirmada() {
    if (!this.selectedCitaId) return;

    this.isCancelling = true;
    const payload = { estatus: 'Cancelada' };

    this.apiService.put(`/citas/${this.selectedCitaId}/status`, payload).subscribe({
      next: (response: any) => {
        console.log('Cita cancelada:', response);
        this.presentToast('✅ Cita cancelada correctamente', 'success');
        
        // Actualizar la cita localmente sin recargar todo
        const index = this.allAppointments.findIndex(c => c.id === this.selectedCitaId);
        if (index !== -1) {
          this.allAppointments[index].estatus = 'Cancelada';
        }
        
        this.selectedCitaId = null;
        this.showCancelAlert = false;
        this.isCancelling = false;
      },
      error: (err) => {
        console.error('Error cancelando cita:', err);
        this.presentToast('❌ Error al cancelar la cita', 'danger');
        this.selectedCitaId = null;
        this.showCancelAlert = false;
        this.isCancelling = false;
      }
    });
  }

  // Método para mostrar toasts
  async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color
    });
    toast.present();
  }

  verDetallesCita(cita: Cita) {
    console.log('Ver detalles de cita:', cita);
    // Puedes navegar a una página de detalles o mostrar modal
    this.router.navigate(['/appointment-detail', cita.id]);
  }

  solicitarCita() {
    this.router.navigate(['/create-appointment']);
  }

  fnPerfilRegresar() {
    this.router.navigate(['/dashboard']);
  }
}