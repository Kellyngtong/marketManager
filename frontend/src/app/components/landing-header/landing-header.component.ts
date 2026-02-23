import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
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

  constructor(private router: Router, private auth: AuthService, private lang: LanguageService) {}

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

  goToWelcome() {
    this.router.navigate(['/welcome']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
