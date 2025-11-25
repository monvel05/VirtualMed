import { Component, importProvidersFrom  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { HttpClientModule } from '@angular/common/http';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
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
  LoadingController, 
  ToastController 
} from '@ionic/angular/standalone';
import { CloudinaryService } from '../../services/cloudinary.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    IonIcon,
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
    HttpClientModule 
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
  uploadedImageUrl: string | null = null; // ← AÑADIDO para Cloudinary

  constructor(
    private fb: FormBuilder,
    private cloudinaryService: CloudinaryService, 
    private loadingController: LoadingController, 
    private toastController: ToastController 
  ) {
    this.loginForm = this.createLoginForm();
    this.registerForm = this.createRegisterForm();
    addIcons({ eyeOutline, eyeOffOutline });

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
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],
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

  login(): void {
    if (this.loginForm.valid) {
      console.log('Login exitoso:', this.loginForm.value);
    } else {
      this.markFormTouched(this.loginForm);
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

  async register(): Promise<void> {
    if (this.registerForm.valid) {
      const loading = await this.loadingController.create({ // ← AÑADIDO
        message: 'Creando cuenta...',
        spinner: 'crescent'
      });
      
      await loading.present();

      try {
        // Si hay imagen pero no se ha subido a Cloudinary, subirla
        if (this.selectedImage && !this.uploadedImageUrl) {
          await this.uploadToCloudinary(this.selectedImage);
        }

        const userData = {
          ...this.registerForm.value,
          profileImage: this.uploadedImageUrl 
        };

        console.log('Registro exitoso:', userData);
        console.log('Foto en Cloudinary:', this.uploadedImageUrl);

        

        // Mostrar mensaje de éxito
        const toast = await this.toastController.create({
          message: 'Cuenta creada exitosamente',
          duration: 3000,
          color: 'success'
        });
        await toast.present();

      } catch (error) {
        console.error('Error en registro:', error);
        
        // Mostrar mensaje de error
        const toast = await this.toastController.create({
          message: 'Error al crear la cuenta',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        await loading.dismiss();
      }
    } else {
      this.markFormTouched(this.registerForm);
    }
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

  // metodo para subir a Cloudinary
  async uploadToCloudinary(file: File): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Subiendo imagen...',
      spinner: 'crescent'
    });
    
    await loading.present();

    try {
      const response: any = await this.cloudinaryService.uploadImage(file);
      this.uploadedImageUrl = response.secure_url;
      
      // Mostrar mensaje de éxito
      const toast = await this.toastController.create({
        message: 'Imagen subida exitosamente',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      
      console.log('Imagen subida a Cloudinary:', this.uploadedImageUrl);
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      this.uploadedImageUrl = null;
      
      // Mostrar mensaje de error
      const toast = await this.toastController.create({
        message: 'Error subiendo imagen',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  private markFormTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}