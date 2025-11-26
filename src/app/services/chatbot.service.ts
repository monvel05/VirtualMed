import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Recomendacion {
  id_doctor: string;
  nombre: string;
  especialidad: string;
  motivo: string;
}

export interface RespuestaChatbot {
  es_medico: boolean;
  mensaje_al_usuario: string;
  recomendaciones: Recomendacion[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  // Tu API en Render
  private apiUrl = 'https://api-telemedicina-final.onrender.com/chat';

  constructor(private http: HttpClient) { }

  enviarMensaje(mensaje: string, contexto: string = 'Ninguno'): Observable<RespuestaChatbot> {
    const body = {
      mensaje: mensaje,
      contexto_medico: contexto
    };
    return this.http.post<RespuestaChatbot>(this.apiUrl, body);
  }
}