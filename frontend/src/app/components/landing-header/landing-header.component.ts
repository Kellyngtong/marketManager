import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { ConfirmationModalComponent } from '../../admin/confirmation-modal/confirmation-modal.component';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-landing-header',
  templateUrl: './landing-header.component.html',
  styleUrls: ['./landing-header.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class LandingHeaderComponent implements OnInit, OnDestroy {
  currentLanguage: string = 'es';
  user$: any;
  private sub: Subscription | null = null;

  translations: Record<string, Record<string, string>> = {
    es: {
      conocenos: 'Conócenos',
      supermercados: 'Supermercados',
      trabaja: 'Trabaja con nosotros',
      atencion: 'Atención al cliente',
      acceder: 'Acceder',
      menu: 'Menú',
      carrito: 'Carrito',
      cerrar: 'Cerrar sesión',
    },
    en: {
      conocenos: 'About',
      supermercados: 'Supermarkets',
      trabaja: 'Careers',
      atencion: 'Support',
      acceder: 'Sign in',
      menu: 'Menu',
      carrito: 'Cart',
      cerrar: 'Logout',
    },
  };

  constructor(
    private router: Router,
    private auth: AuthService,
    private lang: LanguageService,
    private modalCtrl: ModalController,
  ) {}

  ngOnInit(): void {
    this.user$ = this.auth.user$;
    this.currentLanguage = this.lang.current;
    this.sub = this.lang.language$.subscribe((l) => (this.currentLanguage = l));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleLanguage() {
    this.lang.toggle();
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
