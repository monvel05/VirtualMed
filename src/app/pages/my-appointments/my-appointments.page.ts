import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCardContent, IonCard, IonItem, IonLabel, IonButton, IonBadge, IonGrid, IonCol, IonRow, IonIcon, IonList, IonText } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

interface Cita {
  id: number;
  tipo: string;
  fechahoraCita: string;  // Una sola variable para fecha y hora
  doctor: string;
  especialidad: string;
}

@Component({
  selector: 'app-my-appointments',
  templateUrl: './my-appointments.page.html',
  styleUrls: ['./my-appointments.page.scss'],
  standalone: true,
  imports: [IonText, IonList, IonIcon, IonRow, IonCol, IonGrid, IonBadge, IonButton, IonLabel, IonItem, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MyAppointmentsPage implements OnInit {

  allAppointments: Cita[] = [];

  constructor(private router: Router) { }

  fnPerfilRegresar() {
    this.router.navigate(['/dashboard']);
  }

  ngOnInit() {
    this.cargarCitas();
  }

  cargarCitas() {
    // AQUÍ CONECTAS CON TU BASE DE DATOS
    // this.citasService.getCitasUsuario().subscribe(citas => {
    //   this.allAppointments = citas;
    // });

    // Por ahora vacío - se llenará desde BD
    this.allAppointments = [];
  }

  // Función para formatear la fecha y hora bonita
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

  cancelarCita(cita: Cita) {
    console.log('Cancelando cita:', cita);

    if (confirm(`¿Estás seguro de que quieres cancelar tu cita con ${cita.doctor}?`)) {
      // AQUÍ ACTUALIZAS EN TU BASE DE DATOS
      // this.citasService.cancelarCita(cita.id).subscribe(() => {
      alert('Cita cancelada correctamente');
      // });
    }
  }

  solicitarCita() {
    console.log('Solicitando nueva cita');
    this.router.navigate(['/create-appointment']);
  }
}