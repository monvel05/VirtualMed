

import { Component, OnInit , ViewChild, ElementRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard ,IonButton, IonGrid,IonRow,IonCol,IonAvatar, IonItem, IonLabel, IonInput } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.page.html',
  styleUrls: ['./doctor-profile.page.scss'],
  standalone: true,
  imports: [IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonButton, IonGrid, IonRow, IonCol, IonAvatar, IonItem, IonLabel, IonInput]
})
export class DoctorProfilePage implements OnInit {
  // Propiedades del formulario
  avatarFoto: string | null = null; 
  nombre: string = '';
  apellido: string = '';
  edad: number = 0;
  especialidad: string = '';
  subespecialidad: string = '';
  cedula: string = '';
  correo: string = '';

  // Propiedades para validación
  nombreTouched: boolean = false;
  apellidoTouched: boolean = false;
  edadTouched: boolean = false;
  especialidadTouched: boolean = false;
  subespecialidadTouched: boolean = false;
  cedulaTouched: boolean = false;
  correoTouched: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  // Getters para validación
  get nombreInvalid(): boolean {
    return this.nombre.trim().length === 0;
  }

  get apellidoInvalid(): boolean {
    return this.apellido.trim().length === 0;
  }

  get edadInvalid(): boolean {
    return this.edad <= 0;
  }

  get especialidadInvalid(): boolean {
    return this.especialidad.trim().length === 0;
  }

  get subespecialidadInvalid(): boolean {
    return this.subespecialidad.trim().length === 0;
  }

  get cedulaInvalid(): boolean {
    return this.cedula.trim().length === 0;
  }

  get correoInvalid(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailPattern.test(this.correo);
  }

  // Valida si todo el formulario es válido
  get formularioValido(): boolean {
    return !this.nombreInvalid && 
      !this.apellidoInvalid && 
      !this.edadInvalid && 
      !this.especialidadInvalid && 
      !this.subespecialidadInvalid && 
      !this.cedulaInvalid && 
      !this.correoInvalid;
  }

  // Dispara el input de archivo
  seleccionarFoto() {
    this.fileInput.nativeElement.click();
  }

  // Procesa la imagen seleccionada
  archivoSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarFoto = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Quita la foto
  quitarFoto() {
    this.avatarFoto = null;
  }

  // Guarda los cambios del formulario
  guardarCambios() {
    // Marcar todos los campos como tocados para mostrar errores
    this.marcarTodosComoTocados();
    
    if (this.formularioValido) {
      // Aquí va tu lógica para guardar los datos
      console.log('Datos guardados:', {
        nombre: this.nombre,
        apellido: this.apellido,
        edad: this.edad,
        especialidad: this.especialidad,
        subespecialidad: this.subespecialidad,
        cedula: this.cedula,
        correo: this.correo,
        avatar: this.avatarFoto
      });
      
      // Puedes agregar aquí tu llamada a la API o servicio
      alert('Cambios guardados exitosamente');
    } else {
      alert('Por favor completa todos los campos correctamente');
    }
  }

  // Marca todos los campos como tocados para mostrar errores
  private marcarTodosComoTocados() {
    this.nombreTouched = true;
    this.apellidoTouched = true;
    this.edadTouched = true;
    this.especialidadTouched = true;
    this.subespecialidadTouched = true;
    this.cedulaTouched = true;
    this.correoTouched = true;
  }

  fnRegresar() {
    this.router.navigate(['/dashboard']);
  }
}