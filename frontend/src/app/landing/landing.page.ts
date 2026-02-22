import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { colourPalette } from '../../styles';
import { LandingHeaderComponent } from '../components/landing-header/landing-header.component';
import { LandingFooterComponent } from '../components/landing-footer/landing-footer.component';
import { StartShoppingButtonComponent } from '../components/start-shopping-button/start-shopping-button.component';
import { LanguageService } from '../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FormsModule,
    LandingHeaderComponent,
    LandingFooterComponent,
    StartShoppingButtonComponent,
  ],
})
export class LandingPage implements OnInit, OnDestroy {
  zipCode: string = '';
  colors = colourPalette;
  currentLanguage: string = 'es';
  private sub: Subscription | null = null;

  translations: Record<string, Record<string, string>> = {
    es: {
      heroTitle: 'Empieza tu compra en Mercachona',
      section1Title: 'Compra online',
      section1Desc: 'Recibe tu pedido en casa con la misma calidad y frescura de siempre.',
      s1b1: 'Entrega rápida y segura',
      s1b2: 'Productos frescos garantizados',
      s1b3: 'Mejor precio online',
      section2Title: 'Nueva tienda online en algunas zonas',
      section2Desc:
        'Por el momento, la nueva app y web está disponible en Valencia, Barcelona, Madrid y otras poblaciones. Introduce tu código postal arriba para ver si repartimos en tu zona. Si aún no llegamos, ¡apúntate y te avisamos!',
      section3Title: 'Productos de Kilómetro 0',
      section3Desc:
        'Nos comprometemos con los productores locales. Disponemos de una selección cuidada de productos frescos de proximidad garantizados, que ayudan a economías locales y reducen la huella de carbono.',
      s3b1: '100% local y sostenible',
      s3b2: 'Apoyo a productores locales',
      s3b3: 'Menor huella de carbono',
      secondaryCtaTitle: 'Empieza tu compra en Mercachona',
    },
    en: {
      heroTitle: 'Start your shopping at Mercachona',
      section1Title: 'Shop online',
      section1Desc: 'Receive your order at home with the same quality and freshness as always.',
      s1b1: 'Fast and secure delivery',
      s1b2: 'Fresh products guaranteed',
      s1b3: 'Best online price',
      section2Title: 'New online store in some areas',
      section2Desc:
        'For now, the new app and website are available in Valencia, Barcelona, Madrid and other towns. Enter your postal code above to see if we deliver in your area. If we do not reach you yet, sign up and we will notify you!',
      section3Title: 'Kilometer 0 Products',
      section3Desc:
        'We are committed to local producers. We offer a curated selection of fresh local products that support local economies and reduce carbon footprint.',
      s3b1: '100% local and sustainable',
      s3b2: 'Support for local producers',
      s3b3: 'Lower carbon footprint',
      secondaryCtaTitle: 'Start your shopping at Mercachona',
    },
  };

  categories = [
    { icon: 'pizza', label: 'Alimentación', color: '#3FA646' },
    { icon: 'water', label: 'Bebidas', color: '#F2A900' },
    { icon: 'leaf', label: 'Frescos', color: '#2E7D32' },
    { icon: 'home', label: 'Hogar', color: '#3FA646' },
    { icon: 'fitness', label: 'Salud', color: '#F2A900' },
    { icon: 'shirt', label: 'Textil', color: '#2E7D32' },
  ];

  availableZones = [
    { city: 'Valencia', status: 'Disponible' },
    { city: 'Barcelona', status: 'Disponible' },
    { city: 'Madrid', status: 'Disponible' },
    { city: 'Bilbao', status: 'Próximamente' },
    { city: 'Sevilla', status: 'Próximamente' },
    { city: 'Málaga', status: 'Próximamente' },
  ];

  constructor(private router: Router, private lang: LanguageService) {}

  ngOnInit() {
    this.currentLanguage = this.lang.current;
    this.sub = this.lang.language$.subscribe((l) => (this.currentLanguage = l));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  searchZipCode() {
    if (this.zipCode.trim()) {
      // Guardar en localStorage y redirigir a home
      localStorage.setItem('zipCode', this.zipCode);
      this.router.navigate(['/home']);
    }
  }

  startShopping() {
    this.router.navigate(['/home']);
  }

  goToWelcome() {
    this.router.navigate(['/welcome']);
  }

  toggleLanguage() {
    // kept for compatibility if template calls it; delegate to service
    this.lang.toggle();
  }

  notifyZone() {
    if (this.zipCode.trim()) {
      console.log('Notificación activada para:', this.zipCode);
      // Aquí iría la lógica para guardar el código postal para notificación
      alert('Te notificaremos cuando lleguemos a tu zona');
      this.zipCode = '';
    } else {
      alert('Por favor introduce tu código postal');
    }
  }
}
