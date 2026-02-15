import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { PagosService } from '../services/pagos.service';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.page.html',
  styleUrls: ['./payment-success.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class PaymentSuccessPage implements OnInit, OnDestroy {
  orderNumber: string | null = null;
  isLoading = true;
  paymentStatus: 'success' | 'error' | null = null;
  private sessionId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagosService: PagosService,
    private carritoService: CarritoService,
    private loadingCtrl: LoadingController,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.sessionId = params['session_id'] || localStorage.getItem('stripe_session_id');
      if (this.sessionId) {
        // Directamente marcar como pago exitoso sin verificar
        this.paymentStatus = 'success';
        // Limpiar carrito
        this.carritoService.clearCart().subscribe();
        // Limpiar sessionId
        localStorage.removeItem('stripe_session_id');
      } else {
        this.paymentStatus = 'error';
      }
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    // No hay nada que limpiar
  }

  volver() {
    localStorage.removeItem('stripe_session_id');
    this.router.navigate(['/home']);
  }
}