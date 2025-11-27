import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class User {
  //Common fields
  private id: string = '';
  private role: string = '';
  private name: string = '';
  private surname: string = '';
  private age: number = 0;
  private birthDate: Date = new Date();
  private genre: string = '';
  private email: string = '';

  //Just patient related fields
  private height: number = 0;
  private weight: number = 0

  // Just doctor related fields
  private professionalLicense: string = '';
  private medicalSpecialty: string = '';
  private medicalSubspecialty: string = '';

  constructor() { }

  // Getters and Setters

  //ID
  public getId(): string {
    return this.id;
  }

  public setId(id: string): void {
    this.id = id;
  }

  //ROLE
  public getRole(): string {
    return this.role;
  }
  public setRole(role: string): void {
    this.role = role;
  }

  //NAME
  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
  }

  //SURNAME
  public getSurname(): string {
    return this.surname;
  }

  public setSurname(surname: string): void {
    this.surname = surname;
  }


  //AGE
  public getAge(): number {
    return this.age;
  }

  public setAge(age: number): void {
    this.age = age;
  }


  //BIRTH DATE
  public getBirthDate(): Date {
    return this.birthDate;
  }

  public setBirthDate(birthDate: Date): void {
    this.birthDate = birthDate;
  }


  //GENRE
  public getGenre(): string {
    return this.genre;
  }

  public setGenre(genre: string): void {
    this.genre = genre;
  }


  //EMAIL
  public getEmail(): string {
    return this.email;
  } 

  public setEmail(email: string): void {
    this.email = email;
  }

  //HEIGHT
  public getHeight(): number {
    return this.height;
  }

  public setHeight(height: number): void {
    this.height = height;
  }


  //WEIGHT
  public getWeight(): number {
    return this.weight;
  }

  public setWeight(weight: number): void {
    this.weight = weight;
  }


  //PROFESSIONAL LICENSE
  public getProfessionalLicense(): string {
    return this.professionalLicense;
  }

  public setProfessionalLicense(professionalLicense: string): void {
    this.professionalLicense = professionalLicense;
  }


  //MEDICAL SPECIALTY
  public getMedicalSpecialty(): string {
    return this.medicalSpecialty;
  }

  public setMedicalSpecialty(medicalSpecialty: string): void {
    this.medicalSpecialty = medicalSpecialty;
  }


  //MEDICAL SUBSPECIALTY
  public getMedicalSubspecialty(): string {
    return this.medicalSubspecialty;
  }

  public setMedicalSubspecialty(medicalSubspecialty: string): void {
    this.medicalSpecialty = medicalSubspecialty;
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
    this.height = 0;
    this.weight = 0
    this.professionalLicense = '';
    this.medicalSpecialty = '';
    this.medicalSubspecialty = '';
  }
}
