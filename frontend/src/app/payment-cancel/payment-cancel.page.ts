import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-payment-cancel',
  templateUrl: './payment-cancel.page.html',
  styleUrls: ['./payment-cancel.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class PaymentCancelPage {
  constructor(
    private router: Router,
    private auth: AuthService,
  ) {}

  volver() {
    localStorage.removeItem('stripe_session_id');
    this.router.navigate([this.getShoppingRoute()]);
  }

  private getShoppingRoute(): string {
    const user = this.auth.currentUserValue;
    const topLevelRol = user?.idrol;
    const nestedRol = user?.rol?.idrol;
    const rolNombre = String(user?.rol?.nombre || user?.rol || '').toLowerCase();
    const isPremium =
      topLevelRol === 2 || nestedRol === 2 || rolNombre.includes('premium');

    return isPremium ? '/cliente-premium' : '/home';
  }
}
