import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonFooter,
  IonItem,
  IonButton,
  IonCardContent,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon, 
  IonButtons,
  IonInput // <--- IMPORTANTE: Faltaba este componente para escribir
} from '@ionic/angular/standalone';
import {
  ChatbotService,
  Recomendacion,
} from 'src/app/services/chatbot.service';
import { Router } from '@angular/router';

// 1. IMPORTAR LIBRERÍAS DE ICONOS
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';

interface MensajeChat {
  remitente: 'usuario' | 'bot';
  texto: string;
  doctores?: Recomendacion[];
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.page.html',
  styleUrls: ['./chatbot.page.scss'],
  standalone: true,
  imports: [
    IonButtons,
    IonIcon,
    IonCardTitle,
    IonCardSubtitle,
    IonCardHeader,
    IonCard,
    IonCardContent,
    IonButton,
    IonItem,
    IonFooter,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonInput, // <--- AGREGAR AQUÍ TAMBIÉN
    CommonModule,
    FormsModule,
  ],
})
export class ChatbotPage implements OnInit {
  
  // 2. REGISTRAR EL ÍCONO EN EL CONSTRUCTOR
  constructor() {
    addIcons({ arrowBackOutline });
  }

  ngOnInit() {}

  private chatbotService = inject(ChatbotService);
  private router = inject(Router);

  // CONTROL DEL SCROLL
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  mensajeUsuario: string = '';

  // SALUDO FORMAL
  historialChat: MensajeChat[] = [
    {
      remitente: 'bot',
      texto:
        'Bienvenido. Soy su asistente médico virtual. Por favor, describa sus síntomas para analizar su caso y recomendarle al especialista adecuado.',
    },
  ];
  cargando: boolean = false;

  // Función para bajar el scroll automáticamente
  scrollToBottom() {
    setTimeout(() => {
      this.content.scrollToBottom(400); // 400ms de animación suave
    }, 100); // Pequeña espera para que Angular pinte el mensaje nuevo
  }

  enviar() {
    if (!this.mensajeUsuario.trim()) return;

    const textoEnviado = this.mensajeUsuario;
    this.historialChat.push({ remitente: 'usuario', texto: textoEnviado });
    this.mensajeUsuario = '';
    this.cargando = true;

    // 1. Scroll al enviar mensaje del usuario
    this.scrollToBottom();

    this.chatbotService.enviarMensaje(textoEnviado).subscribe({
      next: (aux: any) => {
        this.cargando = false;
        const datos = aux.respuesta || aux;

        this.historialChat.push({
          remitente: 'bot',
          texto: datos.mensaje_al_usuario,
          doctores: datos.recomendaciones,
        });

        // 2. Scroll al recibir respuesta del bot
        this.scrollToBottom();
      },
      error: (e) => {
        this.cargando = false;
        this.historialChat.push({
          remitente: 'bot',
          texto: 'Error de conexión. Intente nuevamente.',
        });
        // 3. Scroll también si hay error
        this.scrollToBottom();
      },
    });
  }

  agendarCita(doctor: Recomendacion) {
    this.router.navigate(['/create-appointment'], {
      queryParams: {
        idDoctor: doctor.id_doctor,
        nombreDoctor: doctor.nombre,
      },
    });
  }

  fnGoBack() {
    this.router.navigate(['/dashboard']);
  }
}