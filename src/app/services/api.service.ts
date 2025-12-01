import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  
  // 👇 CAMBIA ESTO POR LA URL DE TU BACKEND (ej: 'http://localhost:3000/api')
  private apiUrl = 'http://localhost:3000'; 

  constructor() { }

  // Función auxiliar para crear headers
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // 💡 SOLUCIÓN DEL ERROR:
    // En lugar de usar AuthService, leemos directamente lo que guardó UserService
    // para evitar dependencias circulares.
    const savedData = localStorage.getItem('user_flags');
    
    if (savedData) {
      // Si tu backend necesita un token, aquí es donde lo agregarías
      // const user = JSON.parse(savedData);
      // headers = headers.set('Authorization', `Bearer ${user.token}`);
    }

    return headers;
  }

  // ================= MÉTODOS HTTP GENÉRICOS =================

  get(endpoint: string): Observable<any> {
    return this.http.get(`${this.apiUrl}${endpoint}`, { headers: this.getHeaders() });
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, { headers: this.getHeaders() });
  }

  put(endpoint: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}${endpoint}`, data, { headers: this.getHeaders() });
  }

  delete(endpoint: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}${endpoint}`, { headers: this.getHeaders() });
  }
}