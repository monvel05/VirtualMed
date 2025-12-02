
import { Component, OnInit , ViewChild, ElementRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard ,IonButton, IonGrid,IonRow,IonCol,IonAvatar, IonItem, IonLabel, IonInput } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service'; 
import { firstValueFrom } from 'rxjs'; 

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

  // Archivo temporal para subir
  selectedImageFile: File | null = null; 

  // Propiedades para validación
  nombreTouched: boolean = false;
  apellidoTouched: boolean = false;
  edadTouched: boolean = false;
  especialidadTouched: boolean = false;
  subespecialidadTouched: boolean = false;
  cedulaTouched: boolean = false;
  correoTouched: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // AÑADIR UserService al constructor
  constructor(
    private router: Router,
    private userService: UserService 
  ) { }

  ngOnInit() {
    this.cargarDatosDoctor(); 
  }

  // ========== NUEVO MÉTODO: Cargar datos del doctor ==========
  cargarDatosDoctor() {
    const myId = this.userService.getId(); // Obtiene ID del doctor logueado
    
    this.userService.getUserById(myId).subscribe({
      next: (res: any) => {
        if (res.user) {
          // Asignar datos desde el backend
          this.nombre = res.user.nombre || '';
          this.apellido = res.user.apellido || '';
          this.edad = res.user.edad || 0;
          this.especialidad = res.user.especialidad || '';
          this.subespecialidad = res.user.subespecialidad || '';
          this.cedula = res.user.cedula || '';
          this.correo = res.user.correo || '';
          
      
          this.avatarFoto = res.user.avatarFoto || 'assets/avatar.png';
          
          console.log('Datos del doctor cargados desde backend');
        }
      },
      error: (err) => {
        console.error('Error cargando datos del doctor:', err);
        alert('Error al cargar los datos del perfil médico');
      }
    });
  }

  // ========== GETTERS DE VALIDACIÓN (sin cambios) ==========
  
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

  // ========== MÉTODO MODIFICADO: Guardar cambios con backend ==========
  async guardarCambios() {
    // Marcar todos los campos como tocados para mostrar errores
    this.marcarTodosComoTocados();
    
    if (!this.formularioValido) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }

    try {
      // 1. Subir imagen si hay una nueva
      let avatarFotoUrl = this.avatarFoto;
      if (this.selectedImageFile) {
        avatarFotoUrl = await this.subirImagenDoctor(this.selectedImageFile);
      }

      // 2. Preparar datos para enviar al backend
      const dataToUpdate = {
        userId: this.userService.getId(), // Importante: ID del doctor
        nombre: this.nombre,
        apellido: this.apellido,
        edad: this.edad,
        especialidad: this.especialidad,
        subespecialidad: this.subespecialidad,
        cedula: this.cedula,
        correo: this.correo,
        avatarFoto: avatarFotoUrl, // URL como string
        role: 'doctor' // Añadir rol para identificar que es doctor
      };

      // 3. Llamar al servicio para actualizar
      this.userService.updateProfile(dataToUpdate).subscribe({
        next: (res: any) => {
          console.log('Perfil médico actualizado', res);
          alert('Perfil médico actualizado exitosamente');
          
          // Resetear archivo temporal
          this.selectedImageFile = null;
          
          // Recargar datos para asegurar sincronización
          this.cargarDatosDoctor();
        },
        error: (err) => {
          console.error('Error al actualizar perfil médico:', err);
          alert('Error al guardar los cambios');
        }
      });

    } catch (error) {
      console.error('Error en el proceso de guardado:', error);
      alert('Error al subir la imagen');
    }
  }

  // ========== NUEVO MÉTODO: Subir imagen del doctor ==========
  private async subirImagenDoctor(file: File): Promise<string> {
    console.log('Subiendo imagen del doctor:', file.name);

    try {
      // Asumiendo que tu servicio tiene un método uploadFile
    const response = await firstValueFrom(
        this.userService.uploadFile(file, 'avatar')
      );
      return response.url; // El backend debe devolver {url: '...'}
    } catch (error) {
      console.error('Error subiendo imagen del doctor:', error);
      throw error;
    }
  }

  // ========== MÉTODOS MODIFICADOS: Manejo de archivos ==========

  // Dispara el input de archivo
  seleccionarFoto() {
    this.fileInput.nativeElement.click();
  }

  // Procesa la imagen seleccionada (MODIFICADO)
  archivoSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Guardar archivo para subir
      this.selectedImageFile = file;
      
      // Crear previsualización
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarFoto = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Quita la foto (MODIFICADO)
  quitarFoto() {
    this.avatarFoto = null;
    this.selectedImageFile = null;
  }

  // ========== MÉTODOS AUXILIARES ==========

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