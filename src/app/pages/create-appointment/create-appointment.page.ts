
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonGrid, IonIcon, IonCard, IonRow, IonLabel, IonItem, IonRadio,
  IonCol,IonList,IonSelect, IonSelectOption,IonText, IonInput , IonDatetime} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-appointment',
  templateUrl: './create-appointment.page.html',
  styleUrls: ['./create-appointment.page.scss'],
  standalone: true,
  imports: [IonCol, IonRadio, IonItem, IonLabel, IonRow, IonCard,
  IonIcon, IonGrid, IonContent, IonHeader, IonTitle, IonToolbar, 
  CommonModule, FormsModule, IonButton,IonList,IonSelect, IonSelectOption,IonText, IonInput, IonDatetime]
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
  
  // Propiedades para validación
  nombreTouched: boolean = false;
  apellidoTouched: boolean = false;
  edadTouched: boolean = false;
  correoTouched: boolean = false;
  medicaTouched: boolean = false;
  tipoCitaTouched: boolean = false;
  fechaTouched: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  
  
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

  // Valida si todo el formulario es válido
  get formularioValido(): boolean {
    return !this.nombreInvalid && 
          !this.apellidoInvalid && 
          !this.edadInvalid && 
          !this.correoInvalid && 
          !this.medicoInvalid && 
          !this.tipoCitaInvalid && 
          !this.fechaInvalid;
  }
  
  guardarCita() {
    // Marcar todos los campos como tocados para mostrar errores
    this.marcarTodosComoTocados();
    
    if (this.formularioValido) {
      // Aquí va tu lógica para guardar la cita
      console.log('Cita guardada:', {
        nombre: this.nombreCita,
        apellido: this.apellidoCita,
        edad: this.edadCita,
        correo: this.correoCita,
        medico: this.medicoCita,
        tipoCita: this.tipoCita,
        fechaHora: this.fechahoraCita
      });
      
      // Mostrar mensaje de éxito
      alert('¡Cita creada exitosamente!');
      
      // Limpiar el formulario después de guardar
      this.limpiarFormulario();
      
    } else {
      alert('Por favor completa todos los campos correctamente');
    }
  }


  // Marca todos los campos como tocados para mostrar errores
  private marcarTodosComoTocados() {
    this.nombreTouched = true;
    this.apellidoTouched = true;
    this.edadTouched = true;
    this.correoTouched = true;
    this.medicaTouched = true;
    this.tipoCitaTouched = true;
    this.fechaTouched = true;
  }

  // Limpia todos los campos del formulario
  private limpiarFormulario() {
    // Limpiar datos
    this.nombreCita = '';
    this.apellidoCita = '';
    this.edadCita = 0;
    this.correoCita = '';
    this.medicoCita = '';
    this.tipoCita = '';
    this.fechahoraCita = '';
    
    // Resetear estados de validación
    this.nombreTouched = false;
    this.apellidoTouched = false;
    this.edadTouched = false;
    this.correoTouched = false;
    this.medicaTouched = false;
    this.tipoCitaTouched = false;
    this.fechaTouched = false;
    
    console.log('Formulario limpiado, listo para nueva cita');
  }

  fnCitaRegresar() {
    this.router.navigate(['/dashboard']);
  }
}

