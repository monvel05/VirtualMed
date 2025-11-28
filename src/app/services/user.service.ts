import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class User {
  // === CAMPOS PRIVADOS ===
  // Comunes
  private id: string = '';
  private role: string = '';
  private name: string = '';
  private surname: string = '';
  private age: number = 0;
  private birthDate: Date = new Date();
  private genre: string = '';
  private email: string = '';
  private photoUrl: string = '';

  // Específicos de Paciente
  private height: number = 0;
  private weight: number = 0;

  // Específicos de Médico
  private professionalLicense: string = '';
  private medicalSpecialty: string = '';
  private medicalSubspecialty: string = '';

  constructor() {
    // Intentar recuperar datos de localStorage al iniciar el servicio
    this.loadFromStorage();
  }

  // ==========================================
  // LÓGICA DE SESIÓN (NUEVO)
  // ==========================================

  /**
   * Verifica si existe una sesión activa.
   * Se usa en el AuthGuard.
   */
  public validateSession(): boolean {
    // 1. Si ya tenemos un ID en memoria, la sesión es válida.
    if (this.id && this.id !== '') {
      return true;
    }

    // 2. Si no hay en memoria (ej. F5 refresh), intentamos leer de localStorage.
    // Tu método loadFromStorage retorna true si encontró datos.
    return this.loadFromStorage();
  }

  public logout(): void {
    this.clearUserData();
  }


  // ==========================================
  // LÓGICA DE MAPEO Y PERSISTENCIA
  // ==========================================

  public updateFromAPI(data: any): void {
    console.log('🔄 UserService: Recibiendo datos crudos del backend:', data);

    if (!data) {
      console.error('❌ UserService: Los datos recibidos son null o undefined');
      return;
    }

    // 1. Mapeo Seguro (Backend Python -> Frontend Angular)
    this.id = data.id || data._id || data.userId || '';
    this.email = data.email || '';
    this.role = data.role || '';
    
    // Mapeo de nombres (Python usa 'nombre', Angular usa 'name')
    this.name = data.nombre || data.name || ''; 
    this.surname = data.apellidos || data.surname || '';
    
    this.age = Number(data.edad) || 0;
    
    // Manejo seguro de fechas
    if (data.fechaNacimiento) {
      this.birthDate = new Date(data.fechaNacimiento);
    } else if (data.birthDate) {
      this.birthDate = new Date(data.birthDate);
    } else {
      this.birthDate = new Date();
    }

    this.genre = data.genero || data.genre || '';
    this.photoUrl = data.profileImage || data.photoUrl || '';

    // 2. Mapeo de Datos Específicos por Rol
    if (this.role === 'paciente' || this.role === 'patient') {
      this.weight = Number(data.peso) || Number(data.weight) || 0;
      this.height = Number(data.altura) || Number(data.height) || 0;
    }

    if (this.role === 'medico' || this.role === 'doctor') {
      this.professionalLicense = data.cedula || data.professionalLicense || '';
      this.medicalSpecialty = data.especialidad || data.medicalSpecialty || '';
      this.medicalSubspecialty = data.subespecialidad || data.medicalSubspecialty || '';
    }

    // 3. Guardar en Memoria Persistente (LocalStorage)
    try {
      localStorage.setItem('user_data_cache', JSON.stringify(data));
      console.log('✅ UserService: Datos actualizados y guardados. Rol actual:', this.role);
    } catch (e) {
      console.warn('⚠️ No se pudo guardar en localStorage:', e);
    }
  }

  public loadFromStorage(): boolean {
    const data = localStorage.getItem('user_data_cache');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        this.updateFromAPI(parsed);
        return true;
      } catch (e) {
        console.error('Error leyendo localStorage', e);
        localStorage.removeItem('user_data_cache');
        return false;
      }
    }
    return false;
  }

  public clearUserData(): void {
    this.id = '';
    this.role = '';
    this.name = '';
    this.surname = '';
    this.age = 0;
    this.birthDate = new Date();
    this.genre = '';
    this.email = '';
    this.photoUrl = '';
    this.height = 0;
    this.weight = 0;
    this.professionalLicense = '';
    this.medicalSpecialty = '';
    this.medicalSubspecialty = '';

    localStorage.removeItem('user_data_cache');
    console.log('Datos limpiados');
  }

  /**
   * GETTERS Y SETTERS
   */

  // ID
  public getId(): string { return this.id; }
  public setId(id: string): void { this.id = id; }

  // ROLE
  public getRole(): string { return this.role; }
  public setRole(role: string): void { this.role = role; }

  // NAME
  public getName(): string { return this.name; }
  public setName(name: string): void { this.name = name; }

  // SURNAME
  public getSurname(): string { return this.surname; }
  public setSurname(surname: string): void { this.surname = surname; }

  // AGE
  public getAge(): number { return this.age; }
  public setAge(age: number): void { this.age = age; }

  // BIRTH DATE
  public getBirthDate(): Date { return this.birthDate; }
  public setBirthDate(birthDate: Date): void { this.birthDate = birthDate; }

  // GENRE
  public getGenre(): string { return this.genre; }
  public setGenre(genre: string): void { this.genre = genre; }

  // EMAIL
  public getEmail(): string { return this.email; }
  public setEmail(email: string): void { this.email = email; }

  // PHOTO URL
  public getPhotoUrl(): string { return this.photoUrl; }
  public setPhotoUrl(photoUrl: string): void { this.photoUrl = photoUrl; }

  // HEIGHT
  public getHeight(): number { return this.height; }
  public setHeight(height: number): void { this.height = height; }

  // WEIGHT
  public getWeight(): number { return this.weight; }
  public setWeight(weight: number): void { this.weight = weight; }

  // PROFESSIONAL LICENSE
  public getProfessionalLicense(): string { return this.professionalLicense; }
  public setProfessionalLicense(professionalLicense: string): void { this.professionalLicense = professionalLicense; }

  // MEDICAL SPECIALTY
  public getMedicalSpecialty(): string { return this.medicalSpecialty; }
  public setMedicalSpecialty(medicalSpecialty: string): void { this.medicalSpecialty = medicalSpecialty; }

  // MEDICAL SUBSPECIALTY
  public getMedicalSubspecialty(): string { return this.medicalSubspecialty; }
  public setMedicalSubspecialty(medicalSubspecialty: string): void { this.medicalSubspecialty = medicalSubspecialty; }
}