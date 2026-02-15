import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface StripeSessionResponse {
  sessionId: string;
  publicKey: string;
}

export interface StripeSessionStatus {
  id: string;
  status: 'paid' | 'unpaid' | 'no_payment_required';
  customer_email?: string;
  metadata?: any;
}

@Injectable({ providedIn: 'root' })
export class PagosService {
  private API_HOST = this.getApiHost();
  private baseUrl = `${this.API_HOST}/api/pagos`;

  private getApiHost(): string {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Si estamos en ngrok, usar el hostname de ngrok sin puerto
    if (hostname.includes('ngrok')) {
      return `${protocol}//${hostname}`;
    }
    
    // Si estamos en localhost, usar localhost:4800
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:4800`;
    }
    
    // Por defecto, asumir que el API está en el mismo host
    return `${protocol}//${hostname}`;
  }

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  /**
   * Crear sesión de Stripe Checkout
   * Valida que el carrito no esté vacío antes de redirigir a Stripe
   */
  crearSesionPago(datosEnvio: {
    direccion: string;
    telefono?: string;
  }): Observable<StripeSessionResponse> {
    const cfg = this.authHeaders();
    if (!cfg) {
      return throwError(
        () => new Error('Debes iniciar sesión para completar la compra'),
      );
    }

    return this.http.post<StripeSessionResponse>(
      `${this.baseUrl}/crear-sesion`,
      { datosEnvio },
      cfg,
    );
  }

  /**
   * Obtener estado de la sesión de pago
   * Útil para verificar si el pago fue completado
   */
  obtenerEstadoSesion(sessionId: string): Observable<StripeSessionStatus> {
    const cfg = this.authHeaders();
    if (!cfg) {
      return throwError(() => new Error('Debes iniciar sesión'));
    }

    return this.http.get<StripeSessionStatus>(
      `${this.baseUrl}/sesion/${sessionId}`,
      cfg,
    );
  }

  /**
   * Cancelar sesión de pago (marcar como cancelada en UI)
   */
  cancelarSesion(sessionId: string): Observable<{ message: string }> {
    const cfg = this.authHeaders();
    if (!cfg) {
      return throwError(() => new Error('Debes iniciar sesión'));
    }

    return this.http.post<{ message: string }>(
      `${this.baseUrl}/cancelar-sesion/${sessionId}`,
      {},
      cfg,
    );
  }

  /**
   * Cargar Stripe.js dinamicamente
   */
  cargarStripeJs(): Promise<any> {
    return new Promise((resolve, reject) => {
      if ((window as any).Stripe) {
        resolve((window as any).Stripe);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => {
        resolve((window as any).Stripe);
      };
      script.onerror = () => {
        reject(new Error('No se pudo cargar Stripe.js'));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Redirigir a Stripe Checkout
   */
  async redirigirAStripe(sessionId: string, publicKey: string) {
    try {
      const Stripe = await this.cargarStripeJs();
      const stripe = Stripe(publicKey);
      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Error redirigiendo a Stripe:', error);
      throw error;
    }
  }

  private authHeaders() {
    const token = this.auth.getToken();
    if (!token) return null;
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }
}
