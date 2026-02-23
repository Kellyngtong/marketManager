import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { ConfirmationModalComponent } from '../../admin/confirmation-modal/confirmation-modal.component';

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

  constructor(
    private router: Router,
    private auth: AuthService,
    private modalCtrl: ModalController,
  ) {}

  toggleLanguage() {
    const languages = ['es', 'en', 'ca'];
    const currentIndex = languages.indexOf(this.currentLanguage);
    this.currentLanguage = languages[(currentIndex + 1) % languages.length];
    console.log('Idioma cambiado a:', this.currentLanguage);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  async confirmLogout() {
    const modal = await this.modalCtrl.create({
      component: ConfirmationModalComponent,
      cssClass: 'confirmation-modal',
      componentProps: {
        title: 'Cerrar sesión',
        message: '¿Estás seguro de que quieres cerrar sesión?',
        isDangerous: true,
        cancelText: 'Cancelar',
        confirmText: 'Cerrar sesión',
      },
    });

    await modal.present();
    const result = await modal.onDidDismiss();
    if (result.data?.confirmed === true) {
      this.logout();
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
