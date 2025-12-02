import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCardTitle, IonCard, IonCardSubtitle, IonCardHeader, IonCardContent, IonButton, IonButtons, IonBackButton, IonModal, IonIcon, IonLabel, IonText, IonItem } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
// Importamos los servicios necesarios
import { ApiService } from '../../services/api.service';
import { UserService } from '../../services/user.service';

interface CitaDoctor {
  id: string; 
  tipo: string;
  fechahoraCita: string;
  paciente: string;
  pacienteEdad?: number;
  tipoConsulta: string;
  estatus?: string; 
}

@Component({
  selector: 'app-schedule-for-doctor',
  templateUrl: './schedule-for-doctor.page.html',
  styleUrls: ['./schedule-for-doctor.page.scss'],
  standalone: true,
  imports: [IonItem, IonText, IonLabel, IonIcon, IonBackButton, IonButtons, IonButton, IonCardContent, IonCardHeader, IonCardSubtitle, IonCard, IonCardTitle, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonModal]
})
export class ScheduleForDoctorPage implements OnInit {
  
  allAppointments: CitaDoctor[] = [];

  // Inyectamos los servicios
  private apiService = inject(ApiService);
  private userService = inject(UserService);

  constructor(private router: Router) { }

  ngOnInit() {
    this.cargarCitasDoctor();
  }

  // Agregamos este hook de Ionic para recargar las citas cada vez que entras a la pantalla
  // (útil si regresas de otra página y hubo cambios)
  ionViewWillEnter() {
    this.cargarCitasDoctor();
  }

  fnPerfilRegresar() {
    this.router.navigate(['/dashboard']);
  }

  // ESTA ES LA PETICIÓN PARA QUE EL DOCTOR VEA SUS CITAS
  cargarCitasDoctor() {
    const doctorId = this.userService.getId(); 

    if (!doctorId) {
      console.error('No se encontró ID de doctor activo.');
      return;
    }

    // Hacemos la petición GET al backend.
    // Usamos la ruta /citas/doctor/{id} que es común para obtener las citas de un médico específico.
    // Si tu backend usa query params (ej: /citas?medicoId=...), cambia esta línea.
    this.apiService.get(`/citas/doctor/${doctorId}`).subscribe({
      next: (data: any) => {
        this.allAppointments = data;
        console.log('Lista de citas del doctor actualizada:', this.allAppointments);
      },
      error: (error) => {
        console.error('Error al cargar las citas del doctor:', error);
      }
    });
  }

  formatearFechaHora(fechahora: string): string {
    if (!fechahora) return 'Fecha no definida';

    const fecha = new Date(fechahora);
    return fecha.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  // Lógica para CONFIRMAR Cita
  confirmarCita(cita: CitaDoctor) {
    const payload = { estatus: 'Confirmada' };
    
    this.apiService.put(`/citas/${cita.id}/status`, payload).subscribe({
      next: () => {
        console.log(`Cita ${cita.id} confirmada`);
        this.cargarCitasDoctor(); // Recargamos la lista para ver el cambio de estado
        alert(`Has confirmado la cita con ${cita.paciente}`);
      },
      error: (err) => {
        console.error('Error al confirmar cita:', err);
        alert('Hubo un error al intentar confirmar la cita.');
      }
    });
  }

  // Lógica para RECHAZAR Cita
  rechazarCita(cita: CitaDoctor) {
    if (confirm(`¿Estás seguro de que deseas cancelar la cita con ${cita.paciente}?`)) {
      
      const payload = { estatus: 'Cancelada' }; 

      this.apiService.put(`/citas/${cita.id}/status`, payload).subscribe({
        next: () => {
          console.log(`Cita ${cita.id} cancelada`);
          this.cargarCitasDoctor(); // Recargamos la lista
          alert('La cita ha sido cancelada.');
        },
        error: (err) => {
          console.error('Error al cancelar cita:', err);
          alert('Hubo un error al intentar cancelar la cita.');
        }
      });
    }
  }
}