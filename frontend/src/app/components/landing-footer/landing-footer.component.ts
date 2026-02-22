import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { StartShoppingButtonComponent } from '../start-shopping-button/start-shopping-button.component';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-landing-footer',
  templateUrl: './landing-footer.component.html',
  styleUrls: ['./landing-footer.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, StartShoppingButtonComponent],
})
export class LandingFooterComponent implements OnInit, OnDestroy {
  currentLanguage: string = 'es';
  private sub: Subscription | null = null;

  translations: Record<string, Record<string, string>> = {
    es: { copyright: '© 2026 Mercachona S.A. Todos los derechos reservados.' },
    en: { copyright: '© 2026 Mercachona S.A. All rights reserved.' },
  };

  constructor(private lang: LanguageService) {}

  ngOnInit() {
    this.currentLanguage = this.lang.current;
    this.sub = this.lang.language$.subscribe((l) => (this.currentLanguage = l));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
