import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons } from "@ionic/angular/standalone";

// Declaramos las variables para las librerías externas (CDN)
declare var html2canvas: any;
declare var jsPDF: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonButtons, IonContent, IonTitle, IonToolbar, IonHeader, CommonModule, FormsModule],
  templateUrl: './prescription.page.html',
  styleUrls: ['./prescription.page.scss']
})

export class PrescriptionPage implements OnInit {
  isLoading = false;
  showToast = false;
  toastMessage = '';

  currentDate: string = new Date().toLocaleDateString('es-MX', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });

  doctor = {
    name: 'Dr. Juan Pérez',
    specialty: 'Oftalmología',
    subspecialty: 'Cirugía de Cataratas',
    professionalId: '1234567890',
    phoneNumber: '+52 55 1234 5678',
    email: 'juan.perez@correo.com'
  };

  patient = {
    name: 'María González López',
    age: '45 años',
    weight: '65 kg',
    height: '165 cm',
    allergies: 'Ninguna conocida'
  };

  medications: any[] = [
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ];

  ngOnInit() {
    // Cargar librerías PDF
    this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
      .then(() => this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'));
  }

  addNewMedication() {
    this.medications.push({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });
  }

  removeMedication(index: number) {
    if (this.medications.length > 0) {
      this.medications.splice(index, 1);
      this.showToastMsg('Medicamento eliminado');
    }
  }

  printPrescription() {
    window.print();
  }

  async generatePDF() {
    this.isLoading = true;
    setTimeout(async () => {
      try {
        const element = document.getElementById('prescription-pdf');
        if (!element) return;

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          ignoreElements: (el: { getAttribute: (arg0: string) => string; }) => el.getAttribute('data-html2canvas-ignore') === 'true'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`Receta-${this.patient.name}.pdf`);
        this.showToastMsg('PDF Descargado con éxito');
      } catch (error) {
        console.error(error);
        this.showToastMsg('Error al generar PDF');
      } finally {
        this.isLoading = false;
      }
    }, 500);
  }

  showToastMsg(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  private loadScript(url: string): Promise<void> {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${url}"]`)) { resolve(); return; }
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }
}