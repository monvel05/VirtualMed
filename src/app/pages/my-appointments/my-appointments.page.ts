import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCardContent, IonCard, IonItem, IonLabel, IonButton, IonBadge, IonGrid, IonCol, IonRow, IonIcon, IonList, IonText } from '@ionic/angular/standalone';

interface Cita {
  id: number;
  tipo: string;
  fecha: string;
  hora: string;
  doctor: string;
  especialidad: string;
  estatus: 'Pendiente' | 'Confirmada' | 'Completada' | 'Cancelada';
}

@Component({
  selector: 'app-my-appointments',
  templateUrl: './my-appointments.page.html',
  styleUrls: ['./my-appointments.page.scss'],
  standalone: true,
  imports: [IonText, IonList, IonIcon, IonRow, IonCol, IonGrid, IonBadge, IonButton, IonLabel, IonItem, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MyAppointmentsPage implements OnInit {
  
  nextAppointment: Cita | null = null;
  otherAppointments: Cita[] = [];

  constructor() { }

  ngOnInit() {
    this.cargarCitas();
  }

  cargarCitas() {
    const citas: Cita[] = [
      {
        id: 1,
        tipo: 'Consulta General',
        fecha: '2024-12-25',
        hora: '10:00 AM',
        doctor: 'Dra. María López',
        especialidad: 'Medicina General',
        estatus: 'Pendiente'
      },
      {
        id: 2,
        tipo: 'Seguimiento Cardiológico',
        fecha: '2024-12-27',
        hora: '3:00 PM',
        doctor: 'Dr. Jorge Ramírez',
        especialidad: 'Cardiología',
        estatus: 'Confirmada'
      },
      {
        id: 3,
        tipo: 'Consulta Nutricional',
        fecha: '2024-12-06',
        hora: '9:30 AM',
        doctor: 'Lic. Ana Fernández',
        especialidad: 'Nutriología',
        estatus: 'Completada'
      },
      {
        id: 4,
        tipo: 'Dermatología',
        fecha: '2024-11-15',
        hora: '11:00 AM',
        doctor: 'Dr. Carlos Ruiz',
        especialidad: 'Dermatología',
        estatus: 'Cancelada'
      },
      {
        id: 5,
        tipo: 'Pediatría',
        fecha: '2024-11-10',
        hora: '4:00 PM',
        doctor: 'Dra. Laura García',
        especialidad: 'Pediatría',
        estatus: 'Completada'
      }
    ];

    // Ordenar por fecha (más reciente primero)
    const ordenadas = citas.sort((a, b) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    // Próxima cita = primera que no esté completada o cancelada
    this.nextAppointment = ordenadas.find(cita => 
      cita.estatus === 'Pendiente' || cita.estatus === 'Confirmada'
    ) || null;

    // Las demás van al historial
    this.otherAppointments = ordenadas.filter(cita => cita !== this.nextAppointment);
  }

  // SOLO ESTE MÉTODO (simplificado)
  cancelarCita(cita: Cita) {
    console.log('Cancelando cita:', cita);
    
    // Mostrar confirmación
    if (confirm(`¿Estás seguro de que quieres cancelar tu cita con ${cita.doctor}?`)) {
      cita.estatus = 'Cancelada';
      this.actualizarListas();
      alert('Cita cancelada correctamente');
    }
  }

  solicitarCita() {
    console.log('Solicitando nueva cita');
    alert('Redirigiendo a agendamiento de citas');
  }

  // Método privado para reordenar después de cambios
  private actualizarListas() {
    this.cargarCitas();
  }
}