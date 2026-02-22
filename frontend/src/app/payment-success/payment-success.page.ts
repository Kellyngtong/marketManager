import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { PagosService } from '../services/pagos.service';
import { CarritoService } from '../services/carrito.service';
import { AuthService } from '../auth/auth.service';

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
    private auth: AuthService,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.sessionId =
        params['session_id'] || localStorage.getItem('stripe_session_id');

      if (this.sessionId) {
        const loading = await this.loadingCtrl.create({
          message: 'Procesando pago...',
        });
        await loading.present();

        try {
          // Confirmar pago en el servidor
          const response = await this.pagosService
            .confirmarPago(this.sessionId)
            .toPromise();

          this.paymentStatus = 'success';
          this.orderNumber = response?.venta?.num_comprobante || this.sessionId;

          // Limpiar carrito y sesión
          this.carritoService.clearCart().subscribe();
          localStorage.removeItem('stripe_session_id');
        } catch (error: any) {
          console.error('Error confirmando pago:', error);
          this.paymentStatus = 'error';
        } finally {
          await loading.dismiss();
          this.isLoading = false;
        }
      } else {
        this.paymentStatus = 'error';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    // No hay nada que limpiar
  }

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
