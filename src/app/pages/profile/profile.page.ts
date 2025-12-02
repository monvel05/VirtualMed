import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonAvatar, IonGrid, IonRow,
    IonCol, IonItem, IonLabel, IonInput, IonButtons, IonModal, IonCard, IonRadio, 
    IonRadioGroup, IonDatetime, LoadingController } from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Platform } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service'; 
import { firstValueFrom } from 'rxjs'; 

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
  
  // Archivo seleccionado temporalmente
  selectedImageFile: File | null = null; 
  selectedPdfFile: File | null = null; 
  
  // Propiedades para validación
  nombreTouched: boolean = false;
  apellidoTouched: boolean = false;
  edadTouched: boolean = false;
  nacimientoTouched: boolean = false;
  generoTouched: boolean = false;
  pesoTouched: boolean = false;
  alturaTouched: boolean = false;
  correoTouched: boolean = false;

  constructor(
    private platform: Platform, 
    private sanitizer: DomSanitizer, 
    private router: Router,
    private userService: UserService,
    private loadingController: LoadingController 
  ) { }

  ngOnInit() {
    this.cargarDatosPaciente(); 
  }

  // ========== Cargar datos del paciente ==========
  cargarDatosPaciente() {
    const myId = this.userService.getId(); 
    
    this.userService.getUserById(myId).subscribe({
      next: (res: any) => {
        if (res.user) {
          console.log('Datos recibidos del backend:', res.user);

          // Asignar datos (Coinciden con el Backend corregido)
          this.nombre = res.user.nombre || '';
          this.apellido = res.user.apellido || ''; // Backend ahora envía 'apellido'
          this.edad = res.user.edad || 0;
          this.nacimiento = res.user.nacimiento || ''; // Backend ahora envía 'nacimiento'
          this.generoSeleccionado = res.user.genero || '';
          this.peso = res.user.peso || 0;     // Backend ahora envía 'peso'
          this.altura = res.user.altura || 0; // Backend ahora envía 'altura'
          this.correo = res.user.correo || ''; // Backend ahora envía 'correo'
          
          // Avatar
          this.avatarUrl = res.user.profileImage || 'assets/avatar.png';
          
          // PDF
          if (res.user.pdfUrl) {
            this.pdfUrl = res.user.pdfUrl;
            this.pdfver = this.sanitizer.bypassSecurityTrustResourceUrl(res.user.pdfUrl);
          }
        }
      },
      error: (err) => {
        console.error('Error cargando datos:', err);
      }
    });
  }

  // ========== VALIDACIONES ==========
  
  get nombreInvalid(): boolean { return this.nombre.trim().length === 0; }
  get apellidoInvalid(): boolean { return this.apellido.trim().length === 0; }
  get edadInvalid(): boolean { return this.edad <= 0; }
  get nacimientoInvalid(): boolean { return this.nacimiento.trim().length === 0; }
  get generoInvalid(): boolean { return this.generoSeleccionado.trim().length === 0; }
  get pesoInvalid(): boolean { return this.peso <= 0; }
  get alturaInvalid(): boolean { return this.altura <= 0; }
  
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

  // ========== Guardar cambios ==========
  async guardarCambios() {
  this.marcarTodosComoTocados();
  
  // 1. Validación inicial
  if (!this.formularioValido) {
    alert('Por favor completa todos los campos correctamente antes de guardar.');
    return;
  }

  // 2. Mostrar "Cargando..." (Importante para que el usuario espere)
  const loading = await this.loadingController.create({
    message: 'Guardando perfil...',
    spinner: 'crescent'
  });
  await loading.present();

  try {
    // 3. Lógica de Subida de Archivos
    // Si el usuario seleccionó un archivo nuevo, lo subimos.
    // Si no, mantenemos la URL que ya tenía (this.avatarUrl o this.pdfUrl).
    
    let finalProfileImageUrl = this.avatarUrl;
    if (this.selectedImageFile) {
      // Si hay archivo nuevo, subimos y esperamos la nueva URL
      finalProfileImageUrl = await this.subirArchivo(this.selectedImageFile, 'avatar');
    }

    let finalPdfUrl = this.pdfUrl;
    if (this.selectedPdfFile) {
      // Si hay PDF nuevo, subimos y esperamos la nueva URL
      finalPdfUrl = await this.subirArchivo(this.selectedPdfFile, 'pdf');
    }

    // 4. Preparar el objeto EXACTO para la Base de Datos
    // AQUÍ ES DONDE OCURRE LA MAGIA DEL MAPEO
    const dataToUpdate = {
      userId: this.userService.getId(), // ID obligatorio para buscar al usuario
      
      // Datos básicos
      nombre: this.nombre,
      apellidos: this.apellido,      // Frontend 'apellido' -> BD 'apellidos'
      email: this.correo,            // Frontend 'correo'   -> BD 'email'
      
      // Datos demográficos
      edad: this.edad,
      fechaNacimiento: this.nacimiento, // Frontend 'nacimiento' -> BD 'fechaNacimiento'
      genero: this.generoSeleccionado,
      
      // Datos médicos (solo se guardarán si el rol es paciente, pero no estorban)
      peso: this.peso,
      altura: this.altura,
      
      // Archivos (URLs finales)
      profileImage: finalProfileImageUrl,
      pdfUrl: finalPdfUrl
    };

    console.log("Enviando datos al backend:", dataToUpdate);

    // 5. Enviar al Backend
    this.userService.updateProfile(dataToUpdate).subscribe({
      next: async (res) => {
        loading.dismiss(); // Quitamos el cargando
        console.log('Respuesta backend:', res);
        
        // Mensaje de éxito
        alert('¡Perfil actualizado correctamente!');
        
        // Limpiamos los archivos temporales seleccionados
        this.selectedImageFile = null;
        this.selectedPdfFile = null;
      },
      error: (err) => {
        loading.dismiss(); // Quitamos el cargando aunque falle
        console.error('Error al guardar:', err);
        alert('Hubo un error al guardar los cambios. Intenta de nuevo.');
      }
    });

  } catch (error) {
    loading.dismiss(); // Quitamos el cargando si falla la subida de archivos
    console.error('Error crítico:', error);
    alert('Error al subir los archivos. Verifica tu conexión.');
  }
  }


  // ========== Subir archivo ==========
  private async subirArchivo(file: File, tipo: 'avatar' | 'pdf'): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.userService.uploadFile(file, tipo)
      );
      return response.url;
    } catch (error) {
      console.error(`Error subiendo ${tipo}:`, error);
      throw error;
    }
  }

  // ========== Manejo de archivos e Imagen ==========
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
          this.selectedImageFile = file;
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
        this.selectedPdfFile = file;
        const objectUrl = URL.createObjectURL(file);
        this.pdfUrl = objectUrl;
        this.pdfver = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
      }
    };
    input.click();
  }

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

  abrirModal() { this.mostrarModal = true; }
  cerrarModal() { this.mostrarModal = false; }
  
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