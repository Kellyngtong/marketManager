import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { PagosService } from '../services/pagos.service';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.page.html',
  styleUrls: ['./payment-success.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class PaymentSuccessPage implements OnInit {
  orderNumber: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private pagosService: PagosService,
    private carritoService: CarritoService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const sessionId = params['session_id'];
      if (sessionId) {
        this.verificarPago(sessionId);
      }
    });
  }

  private async verificarPago(sessionId: string) {
    try {
      const status = await this.pagosService.obtenerEstadoSesion(sessionId).toPromise();
      if (status && status.status === 'paid') {
        // Pago confirmado, refrescar carrito para verificar que se limpió
        this.carritoService.refreshCart().subscribe();
      }
    } catch (error) {
      console.error('Error verificando pago:', error);
    }
  }
}
