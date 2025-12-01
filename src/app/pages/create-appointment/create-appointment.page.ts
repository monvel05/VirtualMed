import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonGrid, IonIcon, IonCard, IonRow, IonLabel, IonItem, IonRadio,
  IonCol,IonList,IonSelect, IonSelectOption,IonText, IonInput , IonDatetime} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-create-appointment',
  templateUrl: './create-appointment.page.html',
  styleUrls: ['./create-appointment.page.scss'],
  standalone: true,
  imports: [IonCol, IonItem, IonLabel, IonRow, IonCard,
  IonGrid, IonContent, IonHeader, IonTitle, IonToolbar, 
  CommonModule, FormsModule, IonButton,IonSelect, IonSelectOption,IonText, IonInput, IonDatetime]
})
export class CreateAppointmentPage implements OnInit {
  // Propiedades del formulario
  nombreCita: string = '';
  apellidoCita: string = '';
  edadCita: number = 0;
  correoCita: string = '';
  medicoCita: string = '';
  tipoCita: string = '';
  fechahoraCita: string = ''; 
  
  // Lista de médicos cargada dinámicamente
  listaMedicos: any[] = []; // AÑADIR
  
  // Variables para manejo de fecha/hora separadas
  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';
  
  // Propiedades para validación
  nombreTouched: boolean = false;
  apellidoTouched: boolean = false;
  edadTouched: boolean = false;
  correoTouched: boolean = false;
  medicaTouched: boolean = false;
  tipoCitaTouched: boolean = false;
  fechaTouched: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.cargarMedicos(); // Cargar médicos al iniciar
  }

  // ========== NUEVO MÉTODO: Cargar médicos desde backend ==========
  cargarMedicos() {
    this.userService.getMedicosDisponibles().subscribe({
      next: (medicos: any[]) => {
        this.listaMedicos = medicos;
        console.log('Médicos cargados:', this.listaMedicos);
      },
      error: (err) => {
        console.error('Error cargando médicos:', err);
        // Datos de ejemplo si falla la carga
        this.listaMedicos = [
          { id: 'doctor-001', nombre: 'Alejandro', apellido: 'Gómez', especialidad: 'Cardiología' },
          { id: 'doctor-002', nombre: 'Camila', apellido: 'Vargas', especialidad: 'Pediatría' },
          { id: 'doctor-003', nombre: 'Roberto', apellido: 'Martínez', especialidad: 'Dermatología' }
        ];
      }
    });
  }

  // ========== GETTERS DE VALIDACIÓN ==========
  
  get nombreInvalid(): boolean {
    return this.nombreCita.trim().length === 0;
  }

  get apellidoInvalid(): boolean {
    return this.apellidoCita.trim().length === 0;
  }

  get edadInvalid(): boolean {
    return this.edadCita <= 0;
  }

  get correoInvalid(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailPattern.test(this.correoCita);
  }

  get medicoInvalid(): boolean {
    return this.medicoCita.trim().length === 0;
  }

  get tipoCitaInvalid(): boolean {
    return this.tipoCita.trim().length === 0;
  }

  get fechaInvalid(): boolean {
    return this.fechahoraCita.trim().length === 0;
  }

  get formularioValido(): boolean {
    return !this.nombreInvalid && 
          !this.apellidoInvalid && 
          !this.edadInvalid && 
          !this.correoInvalid && 
          !this.medicoInvalid && 
          !this.tipoCitaInvalid && 
          !this.fechaInvalid;
  }
  
  // ========== MÉTODO PARA CREAR CITA ==========
  crearCita() {
    this.marcarTodosComoTocados();
    
    if (!this.formularioValido) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }

    // Validar que se seleccionó un médico
    if (!this.medicoCita) {
      alert('Por favor selecciona un médico');
      return;
    }

    this.procesarFechaHora();

    const nuevaCita = {
      pacienteId: this.userService.getId(),
      medicoId: this.medicoCita, // Ya es el ID real del médico

      // Datos del formulario
      nombreCita: this.nombreCita,
      apellidoCita: this.apellidoCita,
      edadCita: this.edadCita,
      correoCita: this.correoCita,
      tipoCita: this.obtenerTipoCita(this.tipoCita),
      fechahoraCita: this.fechahoraCita,
      fecha: this.fechaSeleccionada, 
      hora: this.horaSeleccionada,
      estado: 'pendiente'
    };

    this.userService.createCita(nuevaCita).subscribe({
      next: (res: any) => {
        if (res.intStatus === 200 || res.success) {
          console.log('Cita creada exitosamente', res);
          alert('¡Cita creada exitosamente!');
          this.limpiarFormulario();
        } else {
          alert(res.message || 'Error al crear la cita');
        }
      },
      error: (err) => {
        console.error('Error en la petición:', err);
        alert('Error de conexión al crear la cita');
      }
    });
  }

  // ========== MÉTODOS AUXILIARES ==========

  private procesarFechaHora() {
    if (this.fechahoraCita) {
      const fecha = new Date(this.fechahoraCita);
      
      this.fechaSeleccionada = fecha.toISOString().split('T')[0];
      this.horaSeleccionada = fecha.toTimeString().split(' ')[0];
    }
  }

  private obtenerTipoCita(valorSelect: string): string {
    const tipos = {
      'presencialCita': 'presencial',
      'llamadaCita': 'virtual',
      'videollamadaCita': 'virtual'
    };
    
    return tipos[valorSelect as keyof typeof tipos] || valorSelect;
  }

  // Alias para mantener compatibilidad
  guardarCita() {
    this.crearCita();
  }

  private marcarTodosComoTocados() {
    this.nombreTouched = true;
    this.apellidoTouched = true;
    this.edadTouched = true;
    this.correoTouched = true;
    this.medicaTouched = true;
    this.tipoCitaTouched = true;
    this.fechaTouched = true;
  }

  private limpiarFormulario() {
    // Limpiar datos
    this.nombreCita = '';
    this.apellidoCita = '';
    this.edadCita = 0;
    this.correoCita = '';
    this.medicoCita = '';
    this.tipoCita = '';
    this.fechahoraCita = '';
    this.fechaSeleccionada = '';
    this.horaSeleccionada = '';
    
    // Resetear estados de validación
    this.nombreTouched = false;
    this.apellidoTouched = false;
    this.edadTouched = false;
    this.correoTouched = false;
    this.medicaTouched = false;
    this.tipoCitaTouched = false;
    this.fechaTouched = false;
  }

  fnCitaRegresar() {
    this.router.navigate(['/dashboard']);
  }
}