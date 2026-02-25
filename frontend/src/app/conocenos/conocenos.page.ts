// conocenos.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface StatItem {
  value: string;
  suffix: string;
  label: string;
}

interface TeamMember {
  name: string;
  role: string;
  quote: string;
}

interface ValueItem {
  title: string;
  desc: string;
  icon: SafeHtml;
}

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-conocenos',
  templateUrl: './conocenos.page.html',
  styleUrls: ['./conocenos.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class ConocenosPage implements OnInit {

  stats: StatItem[] = [
    { value: '320', suffix: '+', label: 'Supermercados' },
    { value: '18K', suffix: '+', label: 'Empleados' },
    { value: '2M',  suffix: '+', label: 'Clientes semanales' },
    { value: '98',  suffix: '%', label: 'Satisfacción del cliente' },
  ];

  teamMembers: TeamMember[] = [
    {
      name: 'Laura Sánchez',
      role: 'CEO & Fundadora',
      quote: 'Mercachona nació de mi amor por los mercados de barrio y la convicción de que la calidad debe ser accesible.'
    },
    {
      name: 'Marcos Gil',
      role: 'Director de Producto',
      quote: 'Seleccionamos cada producto como si fuera para nuestra propia mesa. Esa es la barra que nos ponemos.'
    },
    {
      name: 'Sofía Ramos',
      role: 'Jefa de Sostenibilidad',
      quote: 'Cada decisión que tomamos tiene en cuenta el impacto en el planeta. Es innegociable para nosotros.'
    },
    {
      name: 'Adrián Torres',
      role: 'Director de Tecnología',
      quote: 'Hemos construido la app más intuitiva del sector porque sabemos que tu tiempo es valioso.'
    },
  ];

  values: ValueItem[] = [];

  timelineItems: TimelineItem[] = [
    {
      year: '2008',
      title: 'El primer Mercachona abre sus puertas',
      description: 'Laura Sánchez inaugura el primer local en el barrio de Ruzafa, Valencia, con tan solo 12 empleados y una apuesta clara por el producto local.'
    },
    {
      year: '2012',
      title: 'Expansión a toda la Comunitat Valenciana',
      description: 'Superamos las 50 tiendas en la región y lanzamos nuestra primera marca propia, Naturis, especializada en productos ecológicos.'
    },
    {
      year: '2016',
      title: 'Salto nacional y 5.000 empleados',
      description: 'Abrimos en Madrid, Cataluña y Andalucía. Premio Nacional de Distribución a la Mejor Cadena de Alimentación Fresca.'
    },
    {
      year: '2020',
      title: 'Lanzamiento de la tienda online',
      description: 'En plena pandemia aceleramos la transformación digital: nuestra app alcanzó 1 millón de descargas en sus primeros 6 meses.'
    },
    {
      year: '2024',
      title: 'Compromiso Carbono Cero 2030',
      description: 'Firmamos el compromiso de reducir a cero nuestras emisiones netas para 2030. Toda nuestra flota de reparto es ya 100% eléctrica.'
    },
  ];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    // Los SVG se sanitizan aquí para poder usarlos con [innerHTML] sin errores de Angular
    this.values = [
      {
        title: 'Sostenibilidad',
        desc:  'Reducimos plásticos, apostamos por embalajes reciclables y compensamos nuestras emisiones de CO₂ cada año.',
        icon:  this.svg('<path d="M17 8C8 10 5.9 16.17 3.82 19.9A10 10 0 0 0 21 12C21 12 17 8 17 8z"/><path d="M3.82 19.9C3.82 19.9 8 15 12 14"/>')
      },
      {
        title: 'Cercanía',
        desc:  'Tratamos a cada cliente como un vecino. Nuestro equipo está formado para escuchar y ayudar con calidez.',
        icon:  this.svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>')
      },
      {
        title: 'Calidad sin compromiso',
        desc:  'Cada producto pasa controles rigurosos antes de llegar a la estantería. Sin excepción.',
        icon:  this.svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>')
      },
      {
        title: 'Innovación constante',
        desc:  'Invertimos en tecnología y experiencia de cliente para que comprar sea siempre más fácil y agradable.',
        icon:  this.svg('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>')
      },
    ];
  }

  /** Helper: envuelve paths en un <svg> y lo sanitiza para [innerHTML] */
  private svg(paths: string): SafeHtml {
    const raw = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(raw);
  }
}