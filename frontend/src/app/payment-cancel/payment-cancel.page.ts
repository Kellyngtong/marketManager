import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-payment-cancel',
  templateUrl: './payment-cancel.page.html',
  styleUrls: ['./payment-cancel.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class PaymentCancelPage {
  constructor(private router: Router) {}

  volver() {
    localStorage.removeItem('stripe_session_id');
    this.router.navigate(['/cart']);
  }
}
