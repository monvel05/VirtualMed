import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
// Importar directamente a api service
import { ApiService } from './api.service';

export interface User {
  id: string;
  email: string;
  role: string;
  nombre?: string;
  apellidos?: string;
  tipoPerfil?: string; // A veces viene como tipoPerfil o role
  edad?: number;
  genero?: string;
  profileImage?: string;
  peso?: number;
  altura?: number;
  cedula?: string;
  especialidad?: string;
  subespecialidad?: string;
}

export interface AuthResponse {
  intStatus: number;
  strAnswer: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  private apiService = inject(ApiService);
  private router = inject(Router);
  
  // Banderas de autenticación
  private id: string = '';
  private role: string = ''; // Aquí se guardará 'doctor', 'medico', 'paciente', etc.
  private name: string = '';
  private email: string = '';
  private apellidos: string = '';
  private cedula: string = '';
  private especialidad: string = '';
  private subespecialidad: string = '';
  private isAuthenticatedFlag: boolean = false;

  constructor() {
    this.loadFromStorage();
  }

  // ==================== MÉTODOS DE AUTENTICACIÓN ====================

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/login', credentials).pipe(
      tap(response => {
        // Aceptamos 200 o user presente
        if ((response.intStatus === 200 || response.user) && response.user) {
          console.log('Login exitoso, guardando flags...');
          this.setAuthenticationFlags(response.user);
          this.redirectByRole(this.role); // Usamos this.role que ya se limpió en setFlags
        }
      })
    );
  }

  register(userData: any): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/user', userData).pipe(
      tap(response => {
        if ((response.intStatus === 200 || response.user) && response.user) {
          console.log('Registro exitoso, guardando flags...');
          this.setAuthenticationFlags(response.user);
          this.redirectByRole(this.role);
        }
      })
    );
  }

  logout(): void {
    // Intentamos avisar al back, pero limpiamos el front sí o sí
    this.apiService.post('/logout', {}).subscribe({
      error: () => console.log('Logout en servidor no requerido o falló, continuando...')
    });
    this.clearAuthenticationFlags();
    this.router.navigate(['/login']);
  }

  // ==================== REDIRECCIONAMIENTO ROBUSTO ====================

  private redirectByRole(role: string): void {
    console.log('🤖 INTENTANDO REDIRIGIR...');
    
    // 1. Limpieza de seguridad: minúsculas y sin espacios
    const cleanRole = (role || '').toLowerCase().trim();
    console.log(`📩 Rol original: "${role}" | Rol limpio: "${cleanRole}"`);

    // 2. Lógica de "Doctor" vs "Medico" (Aceptamos ambos)
    if (cleanRole === 'medico' || cleanRole === 'doctor' || cleanRole === 'admin') {
      console.log('✅ Es Médico/Doctor -> Redirigiendo a Dashboard');
      this.router.navigate(['/dashboard']);
    
    } else if (cleanRole === 'paciente' || cleanRole === 'patient') {
      console.log('✅ Es Paciente -> Redirigiendo a Dashboard (o Create Appointment)');
      this.router.navigate(['/dashboard']); // O '/create-appointment' si prefieres
    
    } else {
      console.warn('⚠️ Rol no reconocido o vacío. Redirigiendo a Dashboard por defecto.');
      this.router.navigate(['/dashboard']);
    }
  }

  // ==================== CONTROL DE BANDERAS ====================

  private setAuthenticationFlags(user: any): void {
    this.isAuthenticatedFlag = true;
    this.id = user.id || user._id || ''; // A veces mongo devuelve _id
    
    // IMPORTANTE: Aquí aseguramos que role tenga valor. 
    // Si viene vacío, intentamos usar 'tipoPerfil'
    this.role = user.role || user.tipoPerfil || ''; 
    
    this.name = user.nombre || user.name || '';
    this.email = user.email || '';
    this.apellidos = user.apellidos || '';
    this.cedula = user.cedula || '';
    this.especialidad = user.especialidad || '';
    this.subespecialidad = user.subespecialidad || '';
    
    this.saveToStorage();
  }

  private clearAuthenticationFlags(): void {
    this.isAuthenticatedFlag = false;
    this.id = '';
    this.role = '';
    this.name = '';
    this.email = '';
    this.apellidos = '';
    this.cedula = '';
    this.especialidad = '';
    this.subespecialidad = '';
    localStorage.removeItem('user_flags');
  }

  private saveToStorage() {
    localStorage.setItem('user_flags', JSON.stringify({
      isAuthenticated: true,
      id: this.id,
      role: this.role,
      name: this.name,
      email: this.email,
      apellidos: this.apellidos,
      cedula: this.cedula,
      especialidad: this.especialidad,
      subespecialidad: this.subespecialidad
    }));
  }

  // ===================== VERIFICACIÓN DE ROLES ====================

  hasRole(roleToCheck: string): boolean {
    return this.role.toLowerCase() === roleToCheck.toLowerCase();
  }

  // 🛠️ CORREGIDO: Ahora acepta 'doctor' O 'medico'
  isMedico(): boolean {
    const r = this.role.toLowerCase();
    return r === 'doctor' || r === 'medico';
  }

  isPaciente(): boolean {
    const r = this.role.toLowerCase();
    return r === 'paciente' || r === 'patient';
  }

  getRole(): string {
    return this.role;
  }

  // ==================== GETTERS ====================

  getCurrentUser(): User | null {
    if (!this.isAuthenticatedFlag) return null;
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      nombre: this.name,
      apellidos: this.apellidos,
      cedula: this.cedula,
      especialidad: this.especialidad,
      subespecialidad: this.subespecialidad
    };
  }

  getId(): string { return this.id; }
  getName(): string { return this.name; }
  getEmail(): string { return this.email; }
  getSurname(): string { return this.apellidos; }
  getMedicalSpecialty(): string { return this.especialidad; }
  getMedicalSubspecialty(): string { return this.subespecialidad; }
  getProfessionalLicense(): string { return this.cedula; }

  // Métodos de compatibilidad
  clearUserData(): void { this.clearAuthenticationFlags(); }
  updateFromAPI(userData: any): void { this.setAuthenticationFlags(userData); }
  isAuthenticated(): boolean { return this.isAuthenticatedFlag; }

  loadFromStorage(): boolean {
    const savedFlags = localStorage.getItem('user_flags');
    if (savedFlags) {
      try {
        const flags = JSON.parse(savedFlags);
        this.isAuthenticatedFlag = flags.isAuthenticated;
        this.id = flags.id;
        this.role = flags.role;
        this.name = flags.name;
        this.email = flags.email;
        this.apellidos = flags.apellidos || '';
        this.cedula = flags.cedula || '';
        this.especialidad = flags.especialidad || '';
        this.subespecialidad = flags.subespecialidad || '';
        return true;
      } catch (error) {
        console.error('Error loading from storage:', error);
        this.clearAuthenticationFlags();
        return false;
      }
    }
    return false;
  }

  // ==================== MÉTODOS API (Proxies) ====================

  getCitas(): Observable<any> { return this.apiService.get('/citas'); }
  getCitasByUser(userId: string): Observable<any> { return this.apiService.get(`/users/${userId}/citas`); }
  createCita(citaData: any): Observable<any> { return this.apiService.post('/citas', citaData); }
  getUsers(): Observable<any> { return this.apiService.get('/users'); }
  getUserById(id: string): Observable<any> { return this.apiService.get(`/user/${id}`); }
  updateProfile(userData: any): Observable<any> { return this.apiService.put('/user/profile', userData); }
  getMedicos(): Observable<any> { return this.apiService.get('/medicos'); }
  getPacientes(): Observable<any> { return this.apiService.get('/pacientes'); }
}