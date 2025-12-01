import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCardTitle, IonCard, IonCardSubtitle, IonCardHeader, IonCardContent, IonButton, IonButtons, IonBackButton, IonModal, IonIcon, IonLabel, IonText, IonItem } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

interface CitaDoctor {
  id: number;
  tipo: string;
  fechahoraCita: string;
  paciente: string;
  pacienteEdad?: number;
  tipoConsulta: string;
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

  constructor(private router: Router) { }

  fnPerfilRegresar() {
    this.router.navigate(['/dashboard']);
  }

  ngOnInit() {
    this.cargarCitasDoctor();
  }

  cargarCitasDoctor() {
    // AQUÍ CONECTAS CON TU BASE DE DATOS
    // this.citasService.getCitasDoctor().subscribe({
    //   next: (citas) => {
    //     this.allAppointments = citas;
    //   },
    //   error: (error) => {
    //     console.error('Error cargando citas:', error);
    //     alert('Error al cargar las citas');
    //   }
    // });

    // TEMPORAL: array vacío - se llenará desde BD
    this.allAppointments = [];
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

  confirmarCita(cita: CitaDoctor) {
    // AQUÍ ACTUALIZAS EN BD
    console.log('Confirmar cita:', cita.id);
    alert(`Cita con ${cita.paciente} confirmada`);
  }

  rechazarCita(cita: CitaDoctor) {
    if (confirm(`¿Rechazar cita con ${cita.paciente}?`)) {
      // AQUÍ ACTUALIZAS EN BD
      console.log('Rechazar cita:', cita.id);
      alert('Cita rechazada');
    }
  }
}