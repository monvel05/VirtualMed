import { Component } from '@angular/core';
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
    // ❌ HttpClientModule REMOVIDO - debe estar en app.config.ts
  ],
   providers: [
    CloudinaryService
  ]
})
export class LoginPage {
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
    private authService: AuthService,
    private router: Router
  ) {
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
    this.isLogin = false;
  }

  switchToLogin(): void {
    this.isLogin = true;
  }

  async login(): Promise<void> {
    if (this.loginForm.valid) {
      this.isLoggingIn = true;
      
      try {
        const credentials = this.loginForm.value;
        const response = await this.authService.login(credentials).toPromise();
        
        // ✅ CORRECCIÓN: Verificar que response no sea undefined
        if (!response) {
          throw new Error('No se recibió respuesta del servidor');
        }
        
        if (response.intStatus === 200) {
          console.log('Login exitoso:', response);
          
          const toast = await this.toastController.create({
            message: 'Inicio de sesión exitoso',
            duration: 2000,
            color: 'success'
          });
          await toast.present();

          // Navegar a la página principal después del login
          // this.router.navigate(['/home']);
          
        } else {
          // ✅ CORRECCIÓN: response ya está verificado que no es undefined
          throw new Error(response.strAnswer || 'Error en el login');
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
      this.markFormTouched(this.loginForm);
    }
  }

  async register(): Promise<void> {
    if (this.registerForm.valid) {
      this.isRegistering = true;

      try {
        // Si hay imagen pero no se ha subido a Cloudinary, subirla
        if (this.selectedImage && !this.uploadedImageUrl) {
          await this.uploadToCloudinary(this.selectedImage);
        }

        const userData = {
          ...this.registerForm.value,
          profileImage: this.uploadedImageUrl,
          role: this.registerForm.get('tipoPerfil')?.value
        };

        // Usa el AuthService para registrar
        const response = await this.authService.register(userData).toPromise();
        
        // ✅ CORRECCIÓN: Verificar que response no sea undefined
        if (!response) {
          throw new Error('No se recibió respuesta del servidor');
        }
        
        if (response.intStatus === 200) {
          console.log('Registro exitoso:', response);
          console.log('Foto en Cloudinary:', this.uploadedImageUrl);

          const toast = await this.toastController.create({
            message: 'Cuenta creada exitosamente',
            duration: 3000,
            color: 'success'
          });
          await toast.present();

          // Navegar a la página principal después del registro
          // this.router.navigate(['/home']);

        } else {
          // ✅ CORRECCIÓN: response ya está verificado que no es undefined
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