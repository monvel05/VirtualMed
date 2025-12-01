import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, cameraOutline, checkmarkCircle } from 'ionicons/icons';

import {
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonItem, IonInput, IonLabel, IonButton, IonList, IonRadio,
  IonRadioGroup, IonListHeader, IonDatetime, IonIcon, IonSpinner,
  LoadingController, ToastController 
} from '@ionic/angular/standalone';

import { CloudinaryService } from '../../services/cloudinary.service';
import { UserService } from '../../services/user.service';
@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    IonIcon, IonSpinner, 
    ReactiveFormsModule, 
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem,
    IonInput, IonLabel, IonButton, IonList, IonRadio, IonRadioGroup,
    IonListHeader, IonDatetime,
  ],
   providers: [ CloudinaryService ]
})
export class LoginPage implements OnInit {
  
  isLogin = true;
  loginForm: FormGroup;
  registerForm: FormGroup;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  showLoginPassword = false;
  showRegisterPassword = false;
  showConfirmPassword = false;
  uploadedImageUrl: string | null = null;
  
  isUploading = false;
  isRegistering = false;
  isLoggingIn = false;

  constructor(
    private fb: FormBuilder,
    private cloudinaryService: CloudinaryService, 
    private loadingController: LoadingController, 
    private toastController: ToastController,
    private router: Router,
    private userService: UserService
  ) {
    this.loginForm = this.createLoginForm();
    this.registerForm = this.createRegisterForm();
    addIcons({ eyeOutline, eyeOffOutline, cameraOutline, checkmarkCircle });
    
    // Inicializamos el escuchador de cambios para validaciones dinámicas
    this.setupCedulaValidation();
  }

  ngOnInit() {
    console.log('🧹 Limpiando sesión anterior en pantalla de login...');
    this.userService.clearUserData(); // Primero limpiar SIEMPRE
    
    // Solo después de limpiar, verificar si redirigir
    // (pero como acabamos de limpiar, nunca debería redirigir)
    if (this.userService.isAuthenticated()) {
      console.log('⚠️ Usuario aún autenticado después de limpiar, redirigiendo...');
      this.router.navigate(['/dashboard']);
    }

    // Limpiar formularios
    this.loginForm.reset();
    this.registerForm.reset();
  }

  // ==================== VALIDACIONES DINÁMICAS ====================
  private setupCedulaValidation() {
    this.registerForm.get('tipoPerfil')?.valueChanges.subscribe(perfil => {
      const cedulaControl = this.registerForm.get('cedula');
      const especialidadControl = this.registerForm.get('especialidad');
      const subespecialidadControl = this.registerForm.get('subespecialidad');
      
      const pesoControl = this.registerForm.get('peso');
      const alturaControl = this.registerForm.get('altura');

      if (perfil === 'doctor') {
        // --- REGLAS PARA DOCTOR ---
        console.log('Perfil Doctor seleccionado: Activando validaciones');
        
        // Cédula: Requerida, Solo números, 7-10 dígitos
        cedulaControl?.setValidators([
          Validators.required, 
          Validators.pattern('^[0-9]*$'), 
          Validators.minLength(7), 
          Validators.maxLength(10)
        ]);
        
        especialidadControl?.setValidators([Validators.required]);
        
        // Limpiamos validaciones de paciente
        pesoControl?.clearValidators();
        alturaControl?.clearValidators();

      } else if (perfil === 'paciente') {
        // --- REGLAS PARA PACIENTE ---
        console.log('Perfil Paciente seleccionado');
        
        // Peso y Altura requeridos
        pesoControl?.setValidators([Validators.required]);
        alturaControl?.setValidators([Validators.required]);

        // Limpiamos validaciones de doctor
        cedulaControl?.clearValidators();
        cedulaControl?.setValue('');
        especialidadControl?.clearValidators();
        especialidadControl?.setValue('');
        subespecialidadControl?.setValue('');
      }

      // Actualizamos el estado de todos los controles afectados
      cedulaControl?.updateValueAndValidity();
      especialidadControl?.updateValueAndValidity();
      pesoControl?.updateValueAndValidity();
      alturaControl?.updateValueAndValidity();
    });
  }

  private createLoginForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  private createRegisterForm(): FormGroup {
    return this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      fechaNacimiento: ['', Validators.required],
      genero: ['', Validators.required],
      tipoPerfil: ['', Validators.required],
      cedula: [''], 
      especialidad: [''],
      subespecialidad: [''],
      peso: [''],
      altura: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (!password || !confirmPassword) return null;
    return password.value === confirmPassword.value ? null : { mismatch: true };
  }

  getPasswordError(): string {
    const control = this.registerForm.get('password');
    if (!control?.errors || !control.touched) return '';
    if (control.errors['required']) return 'La contraseña es requerida';
    if (control.errors['minlength']) return 'Mínimo 8 caracteres';
    if (control.errors['pattern']) return 'Debe incluir mayúscula, minúscula, número y carácter especial (@$!%*?&)';
    return '';
  }

  // ==================== NAVEGACIÓN VISUAL ====================
  switchToRegister(): void { this.isLogin = false; }
  switchToLogin(): void { this.isLogin = true; }
  toggleLoginPasswordVisibility() { this.showLoginPassword = !this.showLoginPassword; }
  toggleRegisterPasswordVisibility() { this.showRegisterPassword = !this.showRegisterPassword; }
  toggleConfirmPasswordVisibility() { this.showConfirmPassword = !this.showConfirmPassword; }

  // ==================== LÓGICA DE LOGIN ====================
  async login(): Promise<void> {
    if (this.loginForm.valid) {
      this.isLoggingIn = true;
      try {
        const credentials = this.loginForm.value;
        const response: any = await new Promise((resolve, reject) => {
            this.userService.login(credentials).subscribe({
                next: (res) => resolve(res),
                error: (err) => reject(err)
            });
        });
        
        if (response.user || response.intStatus == 200) { 
           const toast = await this.toastController.create({
             message: 'Inicio de sesión exitoso',
             duration: 2000,
             color: 'success'
           });
           await toast.present();
           // La redirección la hace el servicio automáticamente
        } 
      } catch (error: any) {
        const toast = await this.toastController.create({
          message: 'Credenciales incorrectas o error',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        this.isLoggingIn = false;
      }
    } else {
      this.markFormTouched(this.loginForm);
    }
  }

  // ==================== LÓGICA DE REGISTRO ====================
  async register(): Promise<void> {
    if (this.registerForm.valid) {
      this.isRegistering = true;
      try {
        if (this.selectedImage && !this.uploadedImageUrl) {
          await this.uploadToCloudinary(this.selectedImage);
        }

        const formValue = this.registerForm.value;
        // Limpiamos la cédula si está vacía
        const cedulaLimpia = formValue.cedula && formValue.cedula.trim() !== '' ? formValue.cedula : null;

        const userData = {
          ...formValue,
          profileImage: this.uploadedImageUrl,
          role: this.registerForm.get('tipoPerfil')?.value, // Esto enviará 'doctor' o 'paciente'
          cedula: cedulaLimpia 
        };

        const response: any = await new Promise((resolve, reject) => {
            this.userService.register(userData).subscribe({
                next: (res) => resolve(res),
                error: (err) => reject(err)
            });
        });
        
        if (response.intStatus === 200) {
          const toast = await this.toastController.create({
            message: 'Cuenta creada exitosamente',
            duration: 3000,
            color: 'success'
          });
          await toast.present();
        } else {
          throw new Error(response.strAnswer || 'Error en el registro');
        }

      } catch (error: any) {
        const toast = await this.toastController.create({
          message: error.message || 'Error en el registro',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        this.isRegistering = false;
      }
    } else {
      this.markFormTouched(this.registerForm);
    }
  }

  // ==================== IMÁGENES ====================
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0];
      const reader = new FileReader();
      reader.onload = () => { this.imagePreview = reader.result as string; };
      reader.readAsDataURL(this.selectedImage);
      await this.uploadToCloudinary(this.selectedImage);
    }
  }

  async uploadToCloudinary(file: File): Promise<void> {
    this.isUploading = true;
    try {
      const response: any = await this.cloudinaryService.uploadImage(file);
      this.uploadedImageUrl = response.secure_url;
    } catch (error) {
      const toast = await this.toastController.create({ message: 'Error subiendo imagen', duration: 2000, color: 'danger' });
      await toast.present();
    } finally {
      this.isUploading = false;
    }
  }

  private markFormTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }

}