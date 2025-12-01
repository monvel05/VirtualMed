// validado
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonAvatar, IonGrid,IonRow,
    IonCol, IonItem, IonLabel, IonInput, IonButtons, IonModal, IonCard, IonRadio, 
    IonRadioGroup, IonDatetime } from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Platform } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service'; // AÑADIR ESTO
import { firstValueFrom } from 'rxjs'; // Para convertir Observable a Promise

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonDatetime, IonRadioGroup, IonRadio, IonCard, IonModal, IonButtons, IonButton,
    IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonAvatar, IonGrid, 
    IonRow, IonCol, IonItem, IonLabel, IonInput, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {
  // Propiedades del formulario
  avatarUrl: string | undefined; 
  nombre: string = '';
  apellido: string = '';
  edad: number = 0;
  nacimiento: string = '';
  generoSeleccionado: string = '';
  peso: number = 0;
  altura: number = 0;
  correo: string = '';
  pdfUrl: string | null = null;
  pdfver: SafeResourceUrl | null = null;
  mostrarModal = false;
  
  // Archivo seleccionado temporalmente (para subir)
  selectedImageFile: File | null = null; // AÑADIR
  selectedPdfFile: File | null = null; // AÑADIR
  
  // Propiedades para validación
  nombreTouched: boolean = false;
  apellidoTouched: boolean = false;
  edadTouched: boolean = false;
  nacimientoTouched: boolean = false;
  generoTouched: boolean = false;
  pesoTouched: boolean = false;
  alturaTouched: boolean = false;
  correoTouched: boolean = false;

  // Inyectar UserService
  constructor(
    private platform: Platform, 
    private sanitizer: DomSanitizer, 
    private router: Router,
    private userService: UserService // AÑADIR
  ) { }

  ngOnInit() {
    this.cargarDatosPaciente(); // AÑADIR: cargar datos al iniciar
  }

  // ========== NUEVO MÉTODO: Cargar datos del paciente ==========
  cargarDatosPaciente() {
    const myId = this.userService.getId(); // Obtiene ID del usuario logueado
    
    this.userService.getUserById(myId).subscribe({
      next: (res: any) => {
        if (res.user) {
          // Asignar datos desde el backend
          this.nombre = res.user.nombre || '';
          this.apellido = res.user.apellido || '';
          this.edad = res.user.edad || 0;
          this.nacimiento = res.user.nacimiento || '';
          this.generoSeleccionado = res.user.genero || '';
          this.peso = res.user.peso || 0;
          this.altura = res.user.altura || 0;
          this.correo = res.user.correo || '';
          
          // Avatar: si hay URL, usarla; si no, default
          this.avatarUrl = res.user.profileImage || 'assets/avatar.png';
          
          // PDF: si hay URL, crear versión segura para visualización
          if (res.user.pdfUrl) {
            this.pdfUrl = res.user.pdfUrl;
            this.pdfver = this.sanitizer.bypassSecurityTrustResourceUrl(res.user.pdfUrl);
          }
          
          console.log('Datos cargados desde backend');
        }
      },
      error: (err) => {
        console.error('Error cargando datos:', err);
        alert('Error al cargar los datos del perfil');
      }
    });
  }

  // ========== VALIDACIÓN (sin cambios) ==========
  
  get nombreInvalid(): boolean {
    return this.nombre.trim().length === 0;
  }

  get apellidoInvalid(): boolean {
    return this.apellido.trim().length === 0;
  }

  get edadInvalid(): boolean {
    return this.edad <= 0;
  }

  get nacimientoInvalid(): boolean {
    return this.nacimiento.trim().length === 0;
  }

  get generoInvalid(): boolean {
    return this.generoSeleccionado.trim().length === 0;
  }

  get pesoInvalid(): boolean {
    return this.peso <= 0;
  }

  get alturaInvalid(): boolean {
    return this.altura <= 0;
  }

  get correoInvalid(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailPattern.test(this.correo);
  }

  get formularioValido(): boolean {
    return !this.nombreInvalid && 
          !this.apellidoInvalid && 
          !this.edadInvalid && 
          !this.nacimientoInvalid && 
          !this.generoInvalid && 
          !this.pesoInvalid && 
          !this.alturaInvalid && 
          !this.correoInvalid;
  }

  // ========== MÉTODO MODIFICADO: Guardar cambios ==========
  async guardarCambios() {
    this.marcarTodosComoTocados();
    
    if (!this.formularioValido) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }

    try {
      // 1. Subir imagen si hay una nueva
      let profileImageUrl = this.avatarUrl;
      if (this.selectedImageFile) {
        profileImageUrl = await this.subirArchivo(this.selectedImageFile, 'avatar');
      }

      // 2. Subir PDF si hay uno nuevo
      let pdfUrlFinal = this.pdfUrl;
      if (this.selectedPdfFile) {
        pdfUrlFinal = await this.subirArchivo(this.selectedPdfFile, 'pdf');
      }

      // 3. Preparar datos para enviar al backend
      const dataToUpdate = {
        userId: this.userService.getId(), // Importante: ID del usuario
        nombre: this.nombre,
        apellido: this.apellido,
        edad: this.edad,
        nacimiento: this.nacimiento,
        genero: this.generoSeleccionado,
        peso: this.peso,
        altura: this.altura,
        correo: this.correo,
        profileImage: profileImageUrl, // URL como string
        pdfUrl: pdfUrlFinal // URL como string (no SafeResourceUrl)
      };

      // 4. Llamar al servicio para actualizar
      this.userService.updateProfile(dataToUpdate).subscribe({
        next: (res) => {
          console.log('Datos actualizados', res);
          alert('Perfil guardado exitosamente');
          
          // Resetear archivos temporales
          this.selectedImageFile = null;
          this.selectedPdfFile = null;
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          alert('Error al guardar los cambios');
        }
      });

    } catch (error) {
      console.error('Error en el proceso de guardado:', error);
      alert('Error al subir archivos');
    }
  }

  // ========== NUEVO MÉTODO: Subir archivo al servidor ==========
  private async subirArchivo(file: File, tipo: 'avatar' | 'pdf'): Promise<string> {
    console.log(`Subiendo ${tipo}:`, file.name);

    try {
      const response = await firstValueFrom(
      this.userService.uploadFile(file, tipo) // ← Así es como debe llamarse
      );
      return response.url; // Asumiendo que el backend devuelve {url: '...'}
    } catch (error) {
      console.error(`Error subiendo ${tipo}:`, error);
      throw error;
    }
  }

  // ========== MÉTODOS MODIFICADOS: Manejo de archivos ==========
  
  async seleccionarImagen(){
    if (this.platform.is('capacitor')){
      try{
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: true, 
          resultType: CameraResultType.Uri, 
          source: CameraSource.Prompt,
          promptLabelHeader:"Opciones",
          promptLabelPhoto:"Galeria",
          promptLabelPicture:"Camara",
        });
        this.avatarUrl = image.webPath;
        // Para Capacitor necesitarías convertir webPath a File
      } catch (error){
        console.log("Error con la imagen");
      }
    } else {
      const input = document.createElement('input');
      input.type ='file';
      input.accept = 'image/*';
      input.onchange = (event: any) => {
        const inputEl = event.target as HTMLInputElement;
        if (inputEl?.files && inputEl.files.length > 0) {
          const file = inputEl.files[0];
          
          // Guardar archivo para subir
          this.selectedImageFile = file;
          
          // Crear previsualización
          const reader = new FileReader();
          reader.onload = () => {
            this.avatarUrl = reader.result as string;
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  }

  seleccionarPDF() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = (event: any) => {
      const inputEl = event.target as HTMLInputElement;
      if (inputEl?.files && inputEl.files.length > 0) {
        const file = inputEl.files[0];
        
        // Guardar archivo para subir
        this.selectedPdfFile = file;
        
        // Crear URL temporal y versión segura
        const objectUrl = URL.createObjectURL(file);
        this.pdfUrl = objectUrl; // Temporal para previsualización
        this.pdfver = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
      }
    };
    input.click();
  }

  // ========== MÉTODOS SIN CAMBIOS (pero mantenidos) ==========
  
  private marcarTodosComoTocados() {
    this.nombreTouched = true;
    this.apellidoTouched = true;
    this.edadTouched = true;
    this.nacimientoTouched = true;
    this.generoTouched = true;
    this.pesoTouched = true;
    this.alturaTouched = true;
    this.correoTouched = true;
  }

  quitarImagen() {
    this.avatarUrl = undefined;
    this.selectedImageFile = null;
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  quitarExpediente() {
    this.pdfUrl = null;
    this.pdfver = null;
    this.selectedPdfFile = null;
    this.mostrarModal = false;
  }

  fnPerfilRegresar(){
    this.router.navigate(['/dashboard']);
  }
}