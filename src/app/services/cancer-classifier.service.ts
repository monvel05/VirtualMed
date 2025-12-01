// services/cancer-classifier.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CloudinaryService } from './cloudinary.service';

export interface PredictionRecord {
  _id?: string;
  image_url: string;
  patient_name: string;
  patient_age: number;
  patient_id: string;
  breast_side: string;
  clinical_notes: string;
  classification: 'Benigno' | 'Maligno';
  confidence: number;
  analysis_date: string;
  created_at?: string;
}

export interface AnalysisResponse {
  success: boolean;
  prediction_id: string;
  classification: 'Benigno' | 'Maligno';
  confidence: number;
  confidence_percent: number;
  message: string;
  data: {
    patient_name: string;
    patient_age: string;
    patient_id: string;
    breast_side: string;
    clinical_notes: string;
  };
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CancerClassifierService {
  private baseUrl = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private cloudinaryService: CloudinaryService
  ) { }

  /**
   * MÉTODO PRINCIPAL - Analiza imagen y guarda en BD
   */
  analyzeImage(
    cloudinaryUrl: string, 
    patientData: any,
    imageFile: File
  ): Observable<AnalysisResponse> {
    
    const formData = new FormData();
    formData.append('image_url', cloudinaryUrl);
    formData.append('patient_name', patientData.name);
    formData.append('patient_age', patientData.age.toString());
    formData.append('patient_id', patientData.id);
    formData.append('breast_side', patientData.breastSide);
    formData.append('clinical_notes', patientData.clinicalNotes || '');
    formData.append('image', imageFile);

    return this.http.post<AnalysisResponse>(`${this.baseUrl}/analyze`, formData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Sube imagen a Cloudinary
   */
  async uploadImageToCloudinary(imageFile: File): Promise<string> {
    try {
      const response: any = await this.cloudinaryService.uploadImage(imageFile);
      console.log('✅ Imagen subida a Cloudinary:', response.secure_url);
      return response.secure_url;
    } catch (error) {
      console.error('Error subiendo imagen a Cloudinary:', error);
      throw error;
    }
  }

  checkServerHealth(): Observable<boolean> {
    return this.http.get(`${this.baseUrl}/health`, { observe: 'response' }).pipe(
      map((response: any) => {
        return response.status === 200 && 
               response.body && 
               response.body.status === 'healthy';
      }),
      catchError(() => of(false))
    );
  }

  getPredictions(): Observable<PredictionRecord[]> {
    return this.http.get<PredictionRecord[]>(`${this.baseUrl}/predictions`).pipe(
      catchError(this.handleError)
    );
  }

  getPredictionById(id: string): Observable<PredictionRecord> {
    return this.http.get<PredictionRecord>(`${this.baseUrl}/predictions/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  deletePrediction(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/predictions/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend Flask esté ejecutándose.';
          break;
        case 400:
          errorMessage = error.error?.error || 'Solicitud incorrecta.';
          break;
        case 500:
          errorMessage = error.error?.error || 'Error interno del servidor.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    console.error('Error en CancerClassifierService:', error);
    return throwError(() => new Error(errorMessage));
  }
}