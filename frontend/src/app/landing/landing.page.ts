import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { colourPalette } from '../../styles';
import { LandingHeaderComponent } from '../components/landing-header/landing-header.component';
import { LandingFooterComponent } from '../components/landing-footer/landing-footer.component';
import { StartShoppingButtonComponent } from '../components/start-shopping-button/start-shopping-button.component';

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
export class LandingPage implements OnInit {
  zipCode: string = '';
  colors = colourPalette;

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

  constructor(private router: Router) {}

  ngOnInit() {}

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
    // Cambiar idioma entre ES/EN/CA
    const languages = ['es', 'en', 'ca'];
    const currentIndex = languages.indexOf('es');
    console.log(
      'Idioma cambiado a:',
      languages[(currentIndex + 1) % languages.length],
    );
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
