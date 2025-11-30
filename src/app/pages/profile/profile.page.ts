

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
  
  // Propiedades para validación
  nombreTouched: boolean = false;
  apellidoTouched: boolean = false;
  edadTouched: boolean = false;
  nacimientoTouched: boolean = false;
  generoTouched: boolean = false;
  pesoTouched: boolean = false;
  alturaTouched: boolean = false;
  correoTouched: boolean = false;

  constructor(private platform: Platform, private sanitizer: DomSanitizer, private router: Router) { }

  ngOnInit() {
  }

  // ========== GETTERS DE VALIDACIÓN ==========
  
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

  // Valida si todo el formulario es válido
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

  // ========== MÉTODOS DEL FORMULARIO ==========

  // Guarda los cambios del formulario
  guardarCambios() {
    // Marcar todos los campos como tocados para mostrar errores
    this.marcarTodosComoTocados();
    
    if (this.formularioValido) {
      // Aquí va tu lógica para guardar los datos
      console.log('Datos del paciente guardados:', {
        nombre: this.nombre,
        apellido: this.apellido,
        edad: this.edad,
        nacimiento: this.nacimiento,
        genero: this.generoSeleccionado,
        peso: this.peso,
        altura: this.altura,
        correo: this.correo,
        avatar: this.avatarUrl,
        expediente: this.pdfUrl ? 'Subido' : 'No subido'
      });
      
      // Puedes agregar aquí tu llamada a la API o servicio
      alert('Perfil guardado exitosamente');
    } else {
      alert('Por favor completa todos los campos correctamente');
    }
  }

  // Marca todos los campos como tocados para mostrar errores
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

  // ========== MÉTODOS EXISTENTES (sin cambios) ==========

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
      }catch (error){
        console.log("error con la imagen");
      }
    } else{
      const input = document.createElement('input');
      input.type ='file';
      input.accept = 'image/*';
      input.onchange= (event: any) => {
        const inputEl = event.target as HTMLInputElement;
        if (inputEl?.files && inputEl.files.length > 0) {
          const file = inputEl.files[0];
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

  quitarImagen() {
    this.avatarUrl = undefined;
  }

  seleccionarPDF() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = (event: any) => {
      const inputEl = event.target as HTMLInputElement;
      if (inputEl?.files && inputEl.files.length > 0) {
        const file = inputEl.files[0];
        const objectUrl = URL.createObjectURL(file);
        this.pdfUrl= objectUrl; 
        this.pdfver= this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
      }
    };
    input.click();
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  quitarExpediente() {
    this.pdfUrl = null;
    this.mostrarModal = false;
  }

  fnPerfilRegresar(){
    this.router.navigate(['/dashboard']);
  }
}