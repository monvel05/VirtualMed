import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  ToastController,
} from '@ionic/angular/standalone';

// 1. IMPORTAR LIBRERÍAS (En lugar de declare var...)
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { User } from 'src/app/services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    IonButtons,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './prescription.page.html',
  styleUrls: ['./prescription.page.scss'],
})
export class PrescriptionPage implements OnInit {
  isLoading = false;
  showToast = false;
  toastMessage = '';

  currentDate: string = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  doctor = {
    name: this.user.getName() + ' ' + this.user.getSurname(),
    specialty: this.user.getMedicalSpecialty(),
    subspecialty: this.user.getMedicalSubspecialty(),
    professionalId: this.user.getProfessionalLicense(),
    email: this.user.getEmail(),
  };

  patient = {
    name: '',
    age: '',
    weight: '',
    height: '',
    allergies: '',
  };

  medications: any[] = [
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
  ];

  constructor(private user: User) {}

  ngOnInit() {}

  addNewMedication() {
    this.medications.push({
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    });
  }

  removeMedication(index: number) {
    if (this.medications.length > 0) {
      this.medications.splice(index, 1);
      this.showToastMsg('Medicamento eliminado');
    }
  }

  async generatePDF() {
    this.isLoading = true;

    // Pequeña pausa para asegurar que el DOM esté listo
    setTimeout(async () => {
      try {
        const element = document.getElementById('prescription-pdf');
        if (!element) {
          this.isLoading = false;
          return;
        }

        // GENERACIÓN DEL CANVAS
        const canvas = await html2canvas(element, {
          scale: 2, // Mejor calidad
          useCORS: true,
          backgroundColor: '#ffffff',
          // Esta línea asegura que el atributo del HTML funcione
          ignoreElements: (el) =>
            el.getAttribute('data-html2canvas-ignore') === 'true',
        });

        const imgData = canvas.toDataURL('image/png');

        // SECCIÓN DEL PDF
        const pdf = new jsPDF('p', 'mm', 'a4');

        const imgWidth = 210; // A4 ancho en mm
        const pageHeight = 297; // A4 alto en mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        // Primera página
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Si la receta es muy larga, agrega más páginas
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`Receta-${this.patient.name}.pdf`);
        this.showToastMsg('PDF Descargado con éxito');
      } catch (error) {
        console.error('Error generando PDF:', error);
        this.showToastMsg('Error al generar PDF');
      } finally {
        this.isLoading = false;
      }
    }, 100);
  }

  showToastMsg(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }

  // FUNCIONES PARA LA BASE DE DATOS
  fnBringDoctorData(id: string) {}

  fnBringPatientData(id: string) {}
}
