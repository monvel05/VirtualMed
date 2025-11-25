import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
 
  private cloudName = 'dj4hlbh9l';     // Mi cloud name de Cloudinary
  private uploadPreset = 'upload_preset';           // nombre del upload preset

  constructor(private http: HttpClient) {}

  async uploadImage(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('cloud_name', this.cloudName);

    try {
      const response = await this.http.post(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        formData
      ).toPromise();
      
      return response;
    } catch (error) {
      console.error('Error subiendo imagen a Cloudinary:', error);
      throw error;
    }
  }
}