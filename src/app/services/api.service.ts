// src/app/services/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  private baseUrl = 'http://localhost:3000'; 

  private getHeaders(): HttpHeaders {
    // Obtener usuario actual en lugar de token directamente
    const user = this.authService.getCurrentUser();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Si necesitas autenticación, puedes manejarla de otra forma
    // o agregar el token si está disponible en el localStorage
    const token = localStorage.getItem('currentUser') ? 
      JSON.parse(localStorage.getItem('currentUser')!).token : null;
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { 
      headers: this.getHeaders() 
    });
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, { 
      headers: this.getHeaders() 
    });
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, { 
      headers: this.getHeaders() 
    });
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, { 
      headers: this.getHeaders() 
    });
  }
}