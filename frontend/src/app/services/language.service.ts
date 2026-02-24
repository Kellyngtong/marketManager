import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private lang$ = new BehaviorSubject<string>(localStorage.getItem('lang') || 'es');
  language$ = this.lang$.asObservable();

  setLanguage(lang: string) {
    this.lang$.next(lang);
    try { localStorage.setItem('lang', lang); } catch {}
  }

  toggle() {
    const next = this.lang$.getValue() === 'es' ? 'en' : 'es';
    this.setLanguage(next);
  }

  get current() {
    return this.lang$.getValue();
  }
}
