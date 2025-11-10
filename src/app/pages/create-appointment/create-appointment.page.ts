import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-create-appointment',
  templateUrl: './create-appointment.page.html',
  styleUrls: ['./create-appointment.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CreateAppointmentPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
