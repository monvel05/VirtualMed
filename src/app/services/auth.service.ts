// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  role: string;
  nombre?: string;
  apellidos?: string;
  tipoPerfil?: string; // Para compatibilidad con tu formulario
  // Agrega más campos según necesites
}

export interface AuthResponse {
  intStatus: number;
  strAnswer: string;
  user?: User;
  userId?: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private apiUrl = 'http://localhost:3000'; // URL de tu API Flask
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Verificar si hay usuario en localStorage al inicializar
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  // Login
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.user) {
            this.setCurrentUser(response.user);
            // Redirigir según el rol después del login
            this.redirectByRole(response.user.role);
          }
        })
      );
  }

  // Registro
  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/user`, userData)
      .pipe(
        tap(response => {
          if (response.user) {
            this.setCurrentUser(response.user);
            // Redirigir según el rol después del registro
            this.redirectByRole(response.user.role);
          }
        })
      );
  }

  // Logout
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Verificar autenticación
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Guardar usuario en localStorage y BehaviorSubject
  private setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Verificar rol
  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.role === role : false;
  }

 private redirectByRole(role: string): void {
  if (role === 'paciente') {
    this.router.navigate(['/create-appointment']);
  } else if (role === 'medico') {
    this.router.navigate(['/dashboard']);
  }
}
  // Método para verificar si es paciente
  isPaciente(): boolean {
    return this.hasRole('paciente');
  }

  // Método para verificar si es médico
  isMedico(): boolean {
    return this.hasRole('medico');
  }

}