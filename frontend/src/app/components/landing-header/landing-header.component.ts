import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-landing-header',
  templateUrl: './landing-header.component.html',
  styleUrls: ['./landing-header.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class LandingHeaderComponent {
  currentLanguage: string = 'es';
  user$ = this.auth.user$;

  constructor(private router: Router, private auth: AuthService) {}

  toggleLanguage() {
    const languages = ['es', 'en', 'ca'];
    const currentIndex = languages.indexOf(this.currentLanguage);
    this.currentLanguage = languages[(currentIndex + 1) % languages.length];
    console.log('Idioma cambiado a:', this.currentLanguage);
  }

  goToWelcome() {
    this.router.navigate(['/welcome']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/welcome']);
  }
}
