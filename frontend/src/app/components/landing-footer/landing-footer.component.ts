import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { StartShoppingButtonComponent } from '../start-shopping-button/start-shopping-button.component';

@Component({
  selector: 'app-landing-footer',
  templateUrl: './landing-footer.component.html',
  styleUrls: ['./landing-footer.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, StartShoppingButtonComponent],
})
export class LandingFooterComponent {}
