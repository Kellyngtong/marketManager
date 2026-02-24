import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-start-shopping-button',
  templateUrl: './start-shopping-button.component.html',
  styleUrls: ['./start-shopping-button.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class StartShoppingButtonComponent implements OnInit, OnDestroy {
  @Output() clicked = new EventEmitter<void>();

  currentLanguage: string = 'es';
  private sub: Subscription | null = null;

  translations: Record<string, Record<string, string>> = {
    es: { startShopping: 'Comienza tu compra' },
    en: { startShopping: 'Start your shopping' },
  };

  constructor(private router: Router, private lang: LanguageService) {}

  ngOnInit() {
    this.currentLanguage = this.lang.current;
    this.sub = this.lang.language$.subscribe((l) => (this.currentLanguage = l));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  handleClick() {
    this.clicked.emit();
    this.router.navigate(['/home']);
  }
}
