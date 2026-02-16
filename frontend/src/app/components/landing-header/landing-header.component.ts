import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-header',
  templateUrl: './landing-header.component.html',
  styleUrls: ['./landing-header.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class LandingHeaderComponent {
  currentLanguage: string = 'es';

  constructor(private router: Router) {}

  toggleLanguage() {
    const languages = ['es', 'en', 'ca'];
    const currentIndex = languages.indexOf(this.currentLanguage);
    this.currentLanguage = languages[(currentIndex + 1) % languages.length];
    console.log('Idioma cambiado a:', this.currentLanguage);
  }

  goToWelcome() {
    this.router.navigate(['/welcome']);
  }
}
