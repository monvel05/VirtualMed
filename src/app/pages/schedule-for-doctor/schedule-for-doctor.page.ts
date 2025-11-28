import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCardTitle, IonCard, IonCardSubtitle, IonCardHeader, IonCardContent, IonButton, IonButtons, IonBackButton,IonModal, IonIcon, IonLabel } from '@ionic/angular/standalone';

interface CitaDoctor {
  id: number;
  tipo: string;
  fecha: string;
  hora: string;
  paciente: string;
  pacienteEdad?: number;
  motivo: string;
  urgencia: 'baja' | 'media' | 'alta';
  estatus: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  tipoConsulta: 'virtual' | 'presencial';
  duracion: string;
}

@Component({
  selector: 'app-schedule-for-doctor',
  templateUrl: './schedule-for-doctor.page.html',
  styleUrls: ['./schedule-for-doctor.page.scss'],
  standalone: true,
  imports: [IonLabel, IonIcon, IonBackButton, IonButtons, IonButton, IonCardContent, IonCardHeader, IonCardSubtitle, IonCard, IonCardTitle, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonModal]
})
export class ScheduleForDoctorPage implements OnInit {
  // CITAS ORGANIZADAS POR ESTADO
  pendientes: CitaDoctor[] = [];
  confirmadas: CitaDoctor[] = [];
  completadas: CitaDoctor[] = [];

  constructor() { }

  ngOnInit() {
    this.cargarCitasDoctor();
  }

  cargarCitasDoctor() {
    const citas: CitaDoctor[] = [
      {
        id: 1,
        tipo: 'Consulta General',
        fecha: '2024-12-25',
        hora: '9:00 AM',
        paciente: 'María González',
        pacienteEdad: 35,
        motivo: 'Dolor de cabeza persistente',
        urgencia: 'media',
        estatus: 'pendiente',
        tipoConsulta: 'virtual',
        duracion: '30 min'
      },
      {
        id: 2,
        tipo: 'Seguimiento Cardiológico',
        fecha: '2024-12-25',
        hora: '10:30 AM',
        paciente: 'Carlos Rodríguez',
        pacienteEdad: 62,
        motivo: 'Control presión arterial',
        urgencia: 'baja',
        estatus: 'pendiente',
        tipoConsulta: 'presencial',
        duracion: '45 min'
      },
      {
        id: 3,
        tipo: 'Consulta Urgente',
        fecha: '2024-12-25',
        hora: '11:00 AM',
        paciente: 'Ana Martínez',
        pacienteEdad: 28,
        motivo: 'Fiebre alta y malestar general',
        urgencia: 'alta',
        estatus: 'confirmada',
        tipoConsulta: 'virtual',
        duracion: '20 min'
      },
      {
        id: 4,
        tipo: 'Control Diabetes',
        fecha: '2024-12-25',
        hora: '2:00 PM',
        paciente: 'Jorge López',
        pacienteEdad: 45,
        motivo: 'Revisión niveles glucosa',
        urgencia: 'media',
        estatus: 'confirmada',
        tipoConsulta: 'presencial',
        duracion: '30 min'
      },
      {
        id: 5,
        tipo: 'Dermatología',
        fecha: '2024-12-25',
        hora: '3:30 PM',
        paciente: 'Laura García',
        pacienteEdad: 29,
        motivo: 'Revisión lunar',
        urgencia: 'baja',
        estatus: 'completada',
        tipoConsulta: 'presencial',
        duracion: '25 min'
      }
    ];

    // ORGANIZAR CITAS POR ESTADO
    this.pendientes = citas.filter(cita => cita.estatus === 'pendiente');
    this.confirmadas = citas.filter(cita => cita.estatus === 'confirmada');
    this.completadas = citas.filter(cita => cita.estatus === 'completada');
  }

  // ACCIONES DEL DOCTOR

  confirmarCita(cita: CitaDoctor) {
    console.log('Doctor confirmando cita:', cita);
    cita.estatus = 'confirmada';
    this.actualizarListas();
    alert(`Cita con ${cita.paciente} confirmada`);
  }

  rechazarCita(cita: CitaDoctor) {
    console.log('Doctor rechazando cita:', cita);
    
    if (confirm(`¿Rechazar cita con ${cita.paciente}?`)) {
      cita.estatus = 'cancelada';
      this.actualizarListas();
      alert('Cita rechazada');
    }
  }
  // MÉTODO PRIVADO PARA ACTUALIZAR LISTAS
  private actualizarListas() {
    this.cargarCitasDoctor();
  }
}