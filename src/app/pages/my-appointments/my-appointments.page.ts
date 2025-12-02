import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, 
  IonButtons, IonCardSubtitle, IonCardTitle, IonCardHeader, 
  IonCardContent, IonCard, IonItem, IonLabel, IonButton, 
  IonBadge, IonGrid, IonCol, IonRow, IonIcon, IonList, 
  IonText, IonSpinner, IonAlert, ToastController 
} from '@ionic/angular/standalone';

// Interfaz adaptada a los datos de prueba
interface Cita {
  id: number | string;
  tipo: string;
  fecha: string;      // Fecha visual (ej: 2024-12-25)
  hora: string;       // Hora visual (ej: 10:00 AM)
  fechahoraCita: string; // Para ordenamiento (ISO string)
  doctor: string;
  especialidad: string;
  estatus: string;
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

  // Variables para la vista
  allAppointments: Cita[] = [];
  nextAppointment: Cita | null = null;
  otherAppointments: Cita[] = [];
  
  isLoading: boolean = true;
  isCancelling: boolean = false; // Mantenemos por compatibilidad con el HTML
  selectedCitaId: number | string | null = null;

  constructor(
    private router: Router,
    private toastController: ToastController
    // Eliminamos UserService y ApiService ya que usaremos datos locales
  ) {}

  ngOnInit() {
    this.cargarCitas();
  }

  cargarCitas() {
    this.isLoading = true;

    // Simulación de tiempo de carga (opcional, para realismo)
    setTimeout(() => {
      const citas: Cita[] = [
        {
          id: 1,
          tipo: 'Consulta General',
          fecha: '2024-12-25',
          hora: '10:00 AM',
          fechahoraCita: '2024-12-25T10:00:00',
          doctor: 'Dra. María López',
          especialidad: 'Medicina General',
          estatus: 'Pendiente',
          motivo: 'Dolor de cabeza frecuente'
        },
        {
          id: 2,
          tipo: 'Seguimiento Cardiológico',
          fecha: '2024-12-27',
          hora: '3:00 PM',
          fechahoraCita: '2024-12-27T15:00:00',
          doctor: 'Dr. Jorge Ramírez',
          especialidad: 'Cardiología',
          estatus: 'Confirmada'
        },
        {
          id: 3,
          tipo: 'Consulta Nutricional',
          fecha: '2024-12-06',
          hora: '9:30 AM',
          fechahoraCita: '2024-12-06T09:30:00',
          doctor: 'Lic. Ana Fernández',
          especialidad: 'Nutriología',
          estatus: 'Completada'
        },
        {
          id: 4,
          tipo: 'Dermatología',
          fecha: '2024-11-15',
          hora: '11:00 AM',
          fechahoraCita: '2024-11-15T11:00:00',
          doctor: 'Dr. Carlos Ruiz',
          especialidad: 'Dermatología',
          estatus: 'Cancelada'
        },
        {
          id: 5,
          tipo: 'Pediatría',
          fecha: '2024-11-10',
          hora: '4:00 PM',
          fechahoraCita: '2024-11-10T16:00:00',
          doctor: 'Dra. Laura García',
          especialidad: 'Pediatría',
          estatus: 'Completada'
        }
      ];

      this.allAppointments = citas;

      // Ordenar por fecha (más reciente primero)
      const ordenadas = [...citas].sort((a, b) => 
        new Date(b.fechahoraCita).getTime() - new Date(a.fechahoraCita).getTime()
      );

      // Lógica para determinar la "Próxima Cita"
      // Buscamos la primera que esté Pendiente o Confirmada
      this.nextAppointment = ordenadas.find(cita => 
        cita.estatus === 'Pendiente' || cita.estatus === 'Confirmada'
      ) || null;

      // El resto va al historial (excluyendo la que pusimos como próxima)
      if (this.nextAppointment) {
        this.otherAppointments = ordenadas.filter(cita => cita.id !== this.nextAppointment!.id);
      } else {
        this.otherAppointments = ordenadas;
      }

      this.isLoading = false;
      this.presentToast('Citas cargadas correctamente', 'success');

    }, 1000); // 1 segundo de delay simulado
  }

  // Método simplificado de cancelación (Local, sin API)
  cancelarCita(cita: Cita) {
    this.selectedCitaId = cita.id;
    
    // Usamos confirm nativo de JS como sugería tu cambio
    if (confirm(`¿Estás seguro de que quieres cancelar tu cita con ${cita.doctor}?`)) {
      
      // Actualizamos el estado localmente
      const index = this.allAppointments.findIndex(c => c.id === cita.id);
      if (index !== -1) {
        this.allAppointments[index].estatus = 'Cancelada';
        
        // Recalcular listas para reflejar cambios en la UI
        this.recalcularListas();
        
        this.presentToast('Cita cancelada correctamente', 'success');
      }
    }
    this.selectedCitaId = null;
  }

  // Método auxiliar para no tener que recargar todo
  recalcularListas() {
    const ordenadas = [...this.allAppointments].sort((a, b) => 
      new Date(b.fechahoraCita).getTime() - new Date(a.fechahoraCita).getTime()
    );

    this.nextAppointment = ordenadas.find(cita => 
      cita.estatus === 'Pendiente' || cita.estatus === 'Confirmada'
    ) || null;

    if (this.nextAppointment) {
      this.otherAppointments = ordenadas.filter(cita => cita.id !== this.nextAppointment!.id);
    } else {
      this.otherAppointments = ordenadas;
    }
  }

  // --- MÉTODOS DE APOYO (Keep alive) ---

  // Método compatible con el HTML (aunque usamos confirm nativo arriba, el HTML llama a este)
  abrirConfirmacionCancelacion(cita: Cita) {
    this.cancelarCita(cita); 
  }

  formatearFechaHora(fechahora: string): string {
    if (!fechahora) return 'Fecha no definida';
    try {
      const fecha = new Date(fechahora);
      if (isNaN(fecha.getTime())) return 'Fecha inválida';
      
      return fecha.toLocaleString('es-ES', {
        weekday: 'short', day: '2-digit', month: 'short',
        year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch (error) { return 'Fecha inválida'; }
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

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    toast.present();
  }

  verDetallesCita(cita: Cita) {
    console.log('Ver detalles:', cita);
    // this.router.navigate(['/appointment-detail', cita.id]); 
  }

  solicitarCita() {
    this.router.navigate(['/create-appointment']);
  }

  fnPerfilRegresar() {
    this.router.navigate(['/dashboard']);
  }
}