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
  avatarUrl: string | undefined; 
  nombre: string = '';
  apellido:string ='';
  edad:number=0 ;
  nacimiento: string='';
  generoSeleccionado: string = '';
  peso: number = 0;
  altura: number = 0;
  correo: string = '';
  //pdfUrl: string | null = null;   guarda la URL del PDF
  mostrarModal = false;           
  pdfUrl: SafeResourceUrl | null = null;
  
  

  constructor(private platform: Platform, private sanitizer: DomSanitizer,private router:Router) { }

  ngOnInit() {
  }

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
      const input =document.createElement('input');
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
  this.avatarUrl = undefined; // valor indefinido
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
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);// crea URL temporal del PDF
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

  validarCorreo(){

  }

quitarExpediente() {
  this.pdfUrl = null;   // limpia la variable
  this.mostrarModal = false; // asegura que el modal esté cerrado
}

  fnPerfilRegresar(){
  this.router.navigate(['/dashboard']);
}

}

