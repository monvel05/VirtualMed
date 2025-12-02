import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonBadge,
  IonSpinner,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonGrid,
  IonRow,
  IonCol,
  IonText, IonBackButton } from '@ionic/angular/standalone';
import { ToastController, LoadingController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  cloudUploadOutline, 
  imageOutline, 
  barChartOutline, 
  timeOutline, 
  personCircleOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  helpCircleOutline,
  warningOutline,
  folderOpenOutline,
  analyticsOutline,
  trashOutline,
  medicalOutline,
  documentOutline,
  personOutline,
  calendarOutline,
  femaleOutline,
  idCardOutline,
  bodyOutline,
  alertCircle,
  checkmarkCircle,
  addOutline,
  arrowBackOutline,
  arrowForwardOutline
} from 'ionicons/icons';

import { CancerClassifierService, PredictionRecord, AnalysisResponse } from '../../services/cancer-classifier.service';

interface AnalysisResult {
  classification: 'Benigno' | 'Maligno' | null;
  confidence: number;
}

interface HistoryItem {
  image: string;
  patientName: string;
  patientAge: number;
  patientId: string;
  breastSide: string;
  clinicalNotes: string;
  date: Date;
  classification: 'Benigno' | 'Maligno';
  confidence: number;
}

interface PatientData {
  name: string;
  age: number | null;
  id: string;
  breastSide: string;
  clinicalNotes: string;
}

@Component({
  selector: 'app-cancer-classifier',
  templateUrl: './cancer-classifier.page.html',
  styleUrls: ['./cancer-classifier.page.scss'],
  standalone: true,
  imports: [IonBackButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonSpinner,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    CommonModule,
    FormsModule, IonButtons]
})
export class CancerClassifierPage implements OnInit {
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  isDragOver = false;
  analyzing = false;
  result: AnalysisResult | null = null;
  history: HistoryItem[] = [];
  serverAvailable = true;

  // Datos del paciente
  patientData: PatientData = {
    name: '',
    age: null,
    id: '',
    breastSide: '',
    clinicalNotes: ''
  };

  // Control de secciones
  showPatientForm = true;
  showImageSection = false;
  showResults = false;

  // Opciones para selects
  breastSides = [
    { value: 'Derecha', label: 'Mama Derecha' },
    { value: 'Izquierda', label: 'Mama Izquierda' }
  ];

  constructor(
    private cancerClassifierService: CancerClassifierService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ 
      cloudUploadOutline, 
      imageOutline, 
      barChartOutline, 
      timeOutline, 
      personCircleOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      helpCircleOutline,
      warningOutline,
      folderOpenOutline,
      analyticsOutline,
      trashOutline,
      medicalOutline,
      documentOutline,
      personOutline,
      calendarOutline,
      femaleOutline,
      idCardOutline,
      bodyOutline,
      alertCircle,
      checkmarkCircle,
      addOutline,
      arrowBackOutline,
      arrowForwardOutline
    });
  }

  async ngOnInit() {
    await this.checkServerAvailability();
    await this.loadHistoryFromDatabase();
  }

  async checkServerAvailability() {
    try {
      const isAvailable = await this.cancerClassifierService.checkServerHealth().toPromise();
      this.serverAvailable = isAvailable || false;
      
    } catch (error) {
      this.serverAvailable = false;
    }
  }

  async loadHistoryFromDatabase() {
    try {
      const predictions = await this.cancerClassifierService.getPredictions().toPromise();
      
      if (predictions && predictions.length > 0) {
        // Convertir los datos de MongoDB al formato de HistoryItem
        this.history = predictions.map(prediction => ({
          image: prediction.image_url,
          patientName: prediction.patient_name,
          patientAge: prediction.patient_age,
          patientId: prediction.patient_id,
          breastSide: prediction.breast_side,
          clinicalNotes: prediction.clinical_notes,
          date: new Date(prediction.analysis_date),
          classification: prediction.classification,
          confidence: prediction.confidence
        }));
        
      } else {
        // Si no hay datos en MongoDB, mostrar historial vacío
        this.history = [];
      }
    } catch (error) {
      console.error('Error al cargar historial desde MongoDB:', error);
      // En caso de error, mostrar historial vacío
      this.history = [];
    }
  }


  // Validación de datos del paciente
  isPatientDataValid(): boolean {
    return this.patientData.name.trim() !== '' && 
           this.patientData.age !== null && 
           this.patientData.age > 0 && 
           this.patientData.id.trim() !== '' &&
           this.patientData.breastSide !== '';
  }

  // Navegación entre secciones
  continueToImageUpload() {
    if (this.isPatientDataValid()) {
      this.showPatientForm = false;
      this.showImageSection = true;
      this.showResults = false;
    } else {
      this.showToast('Por favor complete todos los datos requeridos del paciente', 'warning');
    }
  }

  backToPatientForm() {
    this.showPatientForm = true;
    this.showImageSection = false;
    this.showResults = false;
  }

  // Métodos para manejo de imágenes - SOLO PNG
  selectImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.png';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.handleImage(file);
      }
    };
    input.click();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleImage(files[0]);
    }
  }

  handleImage(file: File) {
    if (file.type !== 'image/png') {
      this.showToast('Solo se permiten archivos PNG', 'danger');
      return;
    }

    this.selectedImage = file;
    this.result = null;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
  async analyzeImage() {
    if (!this.selectedImage) return;

    this.analyzing = true;
    this.result = null;

    const loading = await this.loadingController.create({
      message: 'Analizando mamografía con IA...',
      spinner: 'crescent',
      duration: 30000
    });
    
    await loading.present();

    try {
      let response: AnalysisResponse | undefined;
      let cloudinaryUrl = '';
      
      if (this.serverAvailable) {
        console.log('🎯 Iniciando proceso completo de análisis...');
        
        // 1. PRIMERO: Subir imagen a Cloudinary desde el frontend
        cloudinaryUrl = await this.cancerClassifierService.uploadImageToCloudinary(this.selectedImage);
        console.log('✅ URL de Cloudinary:', cloudinaryUrl);

        // 2. SEGUNDO: Enviar todo al backend (URL de Cloudinary + archivo para el modelo)
        response = await this.cancerClassifierService.analyzeImage(
          cloudinaryUrl,
          this.patientData,
          this.selectedImage
        ).toPromise();

        console.log('✅ Respuesta del backend:', response);
        
      } else {
        // Si el servidor no está disponible, mostrar error REAL
        throw new Error('Servidor no disponible. No se pueden realizar análisis en este momento.');
      }
      
      if (response && response.success) {
        // Crear el resultado CON LOS DATOS REALES DEL MODELO
        this.result = {
          classification: response.classification,
          confidence: response.confidence_percent
        };

        // Crear el item del historial CON DATOS REALES
        const historyItem: HistoryItem = {
          image: cloudinaryUrl,
          patientName: this.patientData.name,
          patientAge: this.patientData.age!,
          patientId: this.patientData.id,
          breastSide: this.patientData.breastSide,
          clinicalNotes: this.patientData.clinicalNotes,
          date: new Date(),
          classification: response.classification,
          confidence: response.confidence_percent
        };

        // Agregar al historial local
        this.history.unshift(historyItem);

        this.showResults = true;
        this.showImageSection = false;
        
      } else {
        throw new Error('No se recibió respuesta válida del servidor');
      }

    } catch (error: any) {
      console.error('Error al analizar la imagen:', error);
      this.showToast(`Error: ${error.message}`, 'danger');
      
      // NO MOSTRAR DATOS DE DEMOSTRACIÓN - dejar que el usuario reintente
      this.analyzing = false;
      this.showToast('Por favor, intente nuevamente o verifique la conexión al servidor', 'warning');
    } finally {
      this.analyzing = false;
      await loading.dismiss();
    }
  }

  private async showDemoResult() {
    const isMalignant = Math.random() > 0.5;
    const confidence = Math.floor(Math.random() * 30) + 70;
    const classification = isMalignant ? 'Maligno' : 'Benigno';
    
    this.result = {
      classification: classification,
      confidence: confidence
    };

    // En demo, también intentamos subir a Cloudinary
    let cloudinaryUrl = this.imagePreview!;
    try {
      if (this.serverAvailable && this.selectedImage) {
        cloudinaryUrl = await this.cancerClassifierService.uploadImageToCloudinary(this.selectedImage);
      }
    } catch (error) {
      console.error('Error subiendo a Cloudinary en demo:', error);
    }

    const historyItem: HistoryItem = {
      image: cloudinaryUrl,
      patientName: this.patientData.name,
      patientAge: this.patientData.age!,
      patientId: this.patientData.id,
      breastSide: this.patientData.breastSide,
      clinicalNotes: this.patientData.clinicalNotes,
      date: new Date(),
      classification: classification,
      confidence: confidence
    };

    this.history.unshift(historyItem);

    this.showResults = true;
    this.showImageSection = false;
  }

  // ELIMINAR: saveToDatabase() ya no es necesario porque el backend guarda automáticamente

  newAnalysis() {
    this.selectedImage = null;
    this.imagePreview = null;
    this.result = null;
    this.showPatientForm = true;
    this.showImageSection = false;
    this.showResults = false;
  }

  clearAll() {
    this.patientData = {
      name: '',
      age: null,
      id: '',
      breastSide: '',
      clinicalNotes: ''
    };
    this.selectedImage = null;
    this.imagePreview = null;
    this.result = null;
    this.showPatientForm = true;
    this.showImageSection = false;
    this.showResults = false;
  }

  // Métodos para resultados
  getResultIcon(): string {
    if (!this.result || !this.result.classification) return 'help-circle-outline';
    return this.result.classification === 'Benigno' ? 'checkmark-circle-outline' : 'alert-circle-outline';
  }

  getResultText(): string {
    if (!this.result || !this.result.classification) return 'Esperando análisis';
    return `Resultado: ${this.result.classification}`;
  }

  getResultDescription(): string {
    if (!this.result || !this.result.classification) {
      return 'Carga una imagen de mamografía y haz clic en "Analizar Imagen" para obtener resultados';
    }
    return this.result.classification === 'Benigno' 
      ? 'No se detectaron hallazgos sospechosos de malignidad en la mamografía' 
      : 'Se detectaron hallazgos sospechosos que requieren evaluación adicional';
  }

  getRecommendations(): string {
    if (!this.result || !this.result.classification) {
      return '<p style="color: var(--Gris); font-style: italic;">Los resultados y recomendaciones aparecerán aquí después del análisis.</p>';
    }

    if (this.result.classification === 'Benigno') {
      return `
        <div class="recommendation-content">
          <p><strong>Recomendaciones para hallazgos benignos:</strong></p>
          <ul>
            <li>Continuar con seguimiento médico regular</li>
            <li>Control mamográfico anual según protocolo</li>
            <li>Autoexamen mamario mensual</li>
            <li>Consultar ante cualquier cambio en la mama</li>
            <li>Mantener estilo de vida saludable</li>
          </ul>
          <p class="confidence-note">Confianza del modelo: ${this.result.confidence.toFixed(1)}%</p>
        </div>
      `;
    } else {
      return `
        <div class="recommendation-content">
          <p><strong>Recomendaciones para hallazgos sospechosos:</strong></p>
          <ul>
            <li><strong>Se recomienda evaluación adicional por especialista</strong></li>
            <li>Consulta con mastología/oncología</li>
            <li>Estudios complementarios (ecografía mamaria, resonancia)</li>
            <li>Considerar biopsia para confirmación diagnóstica</li>
            <li>Seguimiento estrecho en 15-30 días</li>
          </ul>
          <p class="confidence-note">Confianza del modelo: ${this.result.confidence.toFixed(1)}%</p>
          <p class="important-note"><strong>Nota importante:</strong> Este es un resultado preliminar de IA. La interpretación final debe ser realizada por un radiólogo especializado.</p>
        </div>
      `;
    }
  }

  getServerStatusText(): string {
    return this.serverAvailable ? 'Conectado' : 'Desconectado';
  }

  getServerStatusColor(): string {
    return this.serverAvailable ? 'success' : 'danger';
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      color,
      position: 'bottom',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}