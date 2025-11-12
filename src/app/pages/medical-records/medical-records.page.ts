import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-medical-records',
  templateUrl: './medical-records.page.html',
  styleUrls: ['./medical-records.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MedicalRecordsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
