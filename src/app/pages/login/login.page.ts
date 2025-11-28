// src/app/pages/login/login.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, cameraOutline, checkmarkCircle } from 'ionicons/icons';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonLabel,
  IonButton,
  IonList,
  IonRadio,
  IonRadioGroup,
  IonListHeader,
  IonDatetime, 
  IonIcon,
  IonSpinner,
  LoadingController, 
  ToastController 
} from '@ionic/angular/standalone';
import { CloudinaryService } from '../../services/cloudinary.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    IonIcon,
    IonSpinner,
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonInput,
    IonLabel,
    IonButton,
    IonList,
    IonRadio,
    IonRadioGroup,
    IonListHeader,
    IonDatetime,
  ],
   providers: [
    CloudinaryService
  ]
})
export class LoginPage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
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
    private userService: User
  ) {
    console.log('LoginPage constructor ejecutado');
    this.loginForm = this.createLoginForm();
    this.registerForm = this.createRegisterForm();
    addIcons({ 
      eyeOutline, 
      eyeOffOutline,
      cameraOutline,
      checkmarkCircle
    });

    this.setupCedulaValidation();
  }

  ngOnInit() {
    console.log('ngOnInit ejecutandose');
    
    // Debug completo de la autenticación
    this.debugAuthInfo();
    
    console.log('authService.isAuthenticated():', this.authService.isAuthenticated());
    /*
    if (this.authService.isAuthenticated()) {
      this.userService.loadFromStorage();
      console.log('USUARIO AUTENTICADO - Redirigiendo...');
      this.redirectByRole();
    } else {
      console.log('USUARIO NO AUTENTICADO - Mostrando login');
    }*/
  }

  // Método para debuggear profundamente la autenticación
  debugAuthInfo() {
    console.log('=== DEBUG AUTH INFO ===');
    console.log('authService.isAuthenticated():', this.authService.isAuthenticated());
    
    const user = this.authService.getCurrentUser();
    console.log('Usuario completo desde authService:', user);
    console.log('Rol del usuario:', user?.role);
    console.log('Tipo de rol:', typeof user?.role);
    console.log('Rol exacto (string):', `"${user?.role}"`);
    
    // Verificar localStorage directamente
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    console.log('Token en localStorage:', storedToken);
    console.log('User en localStorage:', storedUser);
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('User parseado de localStorage:', parsedUser);
        console.log('Rol en user parseado:', parsedUser.role);
        console.log('TipoPerfil en user parseado:', parsedUser.tipoPerfil);
        console.log('Todas las keys del user:', Object.keys(parsedUser));
      } catch (e) {
        console.error('Error parseando user:', e);
      }
    }
    
    // Verificar sessionStorage también
    const sessionToken = sessionStorage.getItem('token');
    const sessionUser = sessionStorage.getItem('user');
    console.log('Token en sessionStorage:', sessionToken);
    console.log('User en sessionStorage:', sessionUser);
    
    console.log('=== FIN DEBUG ===');
  }

  private redirectByRole(): void {
    const role = this.userService.getRole(); 
    
    console.log('redirectByRole - Rol detectado en UserService:', role);

    if (role === 'paciente' || role === 'patient') {
        console.log('PACIENTE - Redirigiendo...');
        this.router.navigate(['/dashboard'], { replaceUrl: true });
    } else if (role === 'medico' || role === 'doctor') {
        console.log('MEDICO - Redirigiendo a dashboard...');
        this.router.navigate(['/dashboard'], { replaceUrl: true });
    } else {
        console.warn('Rol no reconocido:', role);
    }
  }

  private showAuthErrorToast() {
    this.toastController.create({
      message: 'Error: Rol de usuario no reconocido',
      duration: 3000,
      color: 'warning'
    }).then(toast => toast.present());
  }

  private setupCedulaValidation() {
    this.registerForm.get('tipoPerfil')?.valueChanges.subscribe(perfil => {
      const cedulaControl = this.registerForm.get('cedula');
      
      if (perfil === 'medico') {
        console.log('Perfil médico seleccionado: Activando validación de cédula');
        cedulaControl?.setValidators([
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.minLength(7),
          Validators.maxLength(10)
        ]);
      } else {
        console.log('Otro perfil: Desactivando validación de cédula');
        cedulaControl?.clearValidators();
        cedulaControl?.setValue('');
      }
      
      cedulaControl?.updateValueAndValidity();
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
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
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

  switchToRegister(): void {
    console.log('Cambiando a registro');
    this.isLogin = false;
  }

  switchToLogin(): void {
    console.log('Cambiando a login');
    this.isLogin = true;
  }

  async login(): Promise<void> {
    console.log('Intentando login');
    if (this.loginForm.valid) {
      this.isLoggingIn = true;
      
      try {
  const credentials = this.loginForm.value;
  console.log('Credenciales:', credentials);
  
  // Añadimos 'any' para evitar que TypeScript se queje
  const response: any = await this.authService.login(credentials).toPromise();
  
  // 🔍 DEBUG IMPORTANTE: Mira qué diablos está llegando realmente
  console.log('RESPUESTA DEL SERVIDOR:', response); 

  // CORRECCIÓN AQUÍ:
  // Verificamos si existe la propiedad 'user' O si intStatus es 200 (flexible)
  if (response.user || response.intStatus == 200) { 
    
    console.log('✅ Login exitoso:', response);

    // Guardar usuario (tu lógica de UserService)
    if (this.userService && response.user) {
        this.userService.updateFromAPI(response.user);
    }
    
    const toast = await this.toastController.create({
      message: 'Inicio de sesión exitoso',
      duration: 2000,
      color: 'success'
    });
    await toast.present();

    // Redirigir
    setTimeout(() => {
      this.redirectByRole();
    }, 100);

  } else {
    // Si llegamos aquí, es un error real
    throw new Error(response.strAnswer || response.Error || 'Error desconocido en el login');
  }
      } catch (error: any) {
        console.error('Error en login:', error);
        
        let errorMessage = 'Error en el inicio de sesión';
        
        if (error.error?.Error) {
          errorMessage = error.error.Error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        const toast = await this.toastController.create({
          message: errorMessage,
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        this.isLoggingIn = false;
      }
    } else {
      console.log('Formulario de login invalido');
      this.markFormTouched(this.loginForm);
    }
  }

  async register(): Promise<void> {
    console.log('Intentando registro');
    if (this.registerForm.valid) {
      this.isRegistering = true;

      try {
        // Si hay imagen pero no se ha subido a Cloudinary, subirla
        if (this.selectedImage && !this.uploadedImageUrl) {
          await this.uploadToCloudinary(this.selectedImage);
        }

        // En tu método register()

const formValue = this.registerForm.value;

// LÓGICA DE LIMPIEZA:
// Si la cédula es un string vacío, mándalo como null o undefined
const cedulaLimpia = formValue.cedula && formValue.cedula.trim() !== '' 
                     ? formValue.cedula 
                     : null; // O undefined, dependiendo de tu backend

const userData = {
  ...formValue,
  profileImage: this.uploadedImageUrl,
  role: this.registerForm.get('tipoPerfil')?.value,
  cedula: cedulaLimpia // <--- AQUÍ ESTÁ EL CAMBIO
};

console.log('Datos de registro (Cédula corregida):', userData);


        console.log('Datos de registro:', userData);

        // Usa el AuthService para registrar
        const response = await this.authService.register(userData).toPromise();
        
        if (!response) {
          throw new Error('No se recibió respuesta del servidor');
        }
        
        if (response.intStatus === 200) {
          console.log('Registro exitoso:', response);
          console.log('Foto en Cloudinary:', this.uploadedImageUrl);

          if (response.user) {
             this.userService.updateFromAPI(response.user);
          }

          const toast = await this.toastController.create({
            message: 'Cuenta creada exitosamente',
            duration: 3000,
            color: 'success'
          });
          await toast.present();

          // Debug después del registro exitoso
          setTimeout(() => {
            console.log('DEBUG POST-REGISTER:');
            this.debugAuthInfo();
            this.redirectByRole();
          }, 100);

        } else {
          throw new Error(response.strAnswer || 'Error en el registro');
        }

      } catch (error: any) {
        console.error('Error en registro:', error);
        
        let errorMessage = 'Error en el registro';
        
        if (error.error?.Error) {
          errorMessage = error.error.Error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        const toast = await this.toastController.create({
          message: errorMessage,
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        this.isRegistering = false;
      }
    } else {
      console.log('Formulario de registro invalido');
      this.markFormTouched(this.registerForm);
    }
  }

  toggleLoginPasswordVisibility() {
    this.showLoginPassword = !this.showLoginPassword;
  }

  toggleRegisterPasswordVisibility() {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0];
      
      // Previsualización local
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedImage);

      // Subir a Cloudinary automáticamente
      await this.uploadToCloudinary(this.selectedImage);
    } else {
      this.selectedImage = null;
      this.imagePreview = null;
      this.uploadedImageUrl = null;
    }
  }

  async uploadToCloudinary(file: File): Promise<void> {
    this.isUploading = true;

    try {
      const response: any = await this.cloudinaryService.uploadImage(file);
      this.uploadedImageUrl = response.secure_url;
      
      console.log('Imagen subida a Cloudinary:', this.uploadedImageUrl);
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      this.uploadedImageUrl = null;
      
      const toast = await this.toastController.create({
        message: 'Error subiendo imagen',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isUploading = false;
    }
  }

  private markFormTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }


}