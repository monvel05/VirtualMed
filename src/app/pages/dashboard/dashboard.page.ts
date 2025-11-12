import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenu, IonMenuButton, IonGrid, IonDatetime, IonCol, IonRow, IonButton} from '@ionic/angular/standalone';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonCol, IonButtons, IonDatetime, IonContent, IonHeader, IonMenu, IonMenuButton, IonTitle, IonToolbar, IonGrid, IonCol, IonRow, IonButton, IonRow]
})
export class DashboardPage implements OnInit {

  role = "doctor";

  constructor() { }

  ngOnInit() {
  }

  highlightedDates = [
    {
      date: '2025-11-10',
      textColor: '#800080',
      backgroundColor: '#ffc0cb',
      border: '1px solid #e91e63',
    },
    {
      date: '2025-11-02',
      textColor: '#09721b',
      backgroundColor: '#c8e5d0',
      border: '1px solid #4caf50',
    },
    {
      date: '2025-11-15',
      textColor: 'var(--ion-color-secondary)',
      backgroundColor: 'rgb(var(--ion-color-secondary-rgb), 0.18)',
      border: '1px solid var(--ion-color-secondary-shade)',
    },
    {
      date: '2025-11-22',
      textColor: 'rgb(68, 10, 184)',
      backgroundColor: 'rgb(211, 200, 229)',
      border: '1px solid rgb(103, 58, 183)',
    },
  ];
}
