import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonGrid, IonIcon, IonCard, IonRow, IonLabel, IonItem, IonRadio,
  IonCol,IonList,IonSelect, IonSelectOption,IonText, IonInput , IonDatetime} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-appointment',
  templateUrl: './create-appointment.page.html',
  styleUrls: ['./create-appointment.page.scss'],
  standalone: true,
  imports: [IonCol, IonRadio, IonItem, IonLabel, IonRow, IonCard,
  IonIcon, IonGrid, IonContent, IonHeader, IonTitle, IonToolbar, 
  CommonModule, FormsModule, IonButton,IonList,IonSelect, IonSelectOption,IonText, IonInput, IonDatetime]
})
export class CreateAppointmentPage implements OnInit {
  nombreCita: string='';
  apellidoCita: string='';
  edadCita: string='';
  correoCita: string= '';
  medicoCita: any;
  tipoCita: any;
  fechahoraCita: string = new Date().toISOString(); 
  

  constructor(private router: Router) { }

  ngOnInit() {
  }

  guardarCita(){

  }

  fnCitaRegresar(){
    this.router.navigate(['/dashboard']);
  }

}
