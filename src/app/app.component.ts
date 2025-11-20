import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home,
  settings,
  notifications,
  alert,
  chevronUpCircle,
  close
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    //Iconos globales para el ion fab en las páginas
    addIcons({
      home,
      settings,
      notifications,
      alert,
      chevronUpCircle,
      close
    });
  }
}
