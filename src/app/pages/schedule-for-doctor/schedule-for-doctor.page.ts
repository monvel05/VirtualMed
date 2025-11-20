import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-schedule-for-doctor',
  templateUrl: './schedule-for-doctor.page.html',
  styleUrls: ['./schedule-for-doctor.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ScheduleForDoctorPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
