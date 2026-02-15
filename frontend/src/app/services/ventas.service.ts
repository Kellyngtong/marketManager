import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface VentaDetalleItem {
  iddetalle_venta: number;
  cantidad: number;
  precio: number;
  subtotal: number;
  articulo?: {
    idarticulo: number;
    nombre: string;
    imagen?: string;
  };
}

export interface VentaResumen {
  idventa: number;
  numero: string;
  fecha: string;
  metodo_pago: string;
  direccion_envio: string;
  estado: string;
  impuesto: number;
  total: number;
  items: VentaDetalleItem[];
}

@Injectable({ providedIn: 'root' })
export class VentasService {
  private API_HOST = this.getApiHost();
  private baseUrl = `${this.API_HOST}/api/ventas`;
  private historyUrl = `${this.API_HOST}/api/mis-compras`;

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

  constructor(private http: HttpClient, private auth: AuthService) {}

  checkout(payload: { metodoPago: string; numeroTarjeta?: string | null; datosEnvio: { direccion: string; telefono?: string } }) {
    const cfg = this.authHeaders();
    if (!cfg) {
      return throwError(() => new Error('Debes iniciar sesión para completar la compra'));
    }

    return this.http.post(`${this.baseUrl}`, payload, cfg);
  }

  getHistorial(): Observable<{ historial: VentaResumen[] }> {
    const cfg = this.authHeaders();
    if (!cfg) {
      return throwError(() => new Error('Debes iniciar sesión para ver tus compras'));
    }

    return this.http.get<{ historial: VentaResumen[] }>(this.historyUrl, cfg);
  }

  getDetalleVenta(id: number): Observable<{ venta: VentaResumen }> {
    const cfg = this.authHeaders();
    if (!cfg) {
      return throwError(() => new Error('Debes iniciar sesión para ver el detalle'));
    }

    return this.http.get<{ venta: VentaResumen }>(`${this.baseUrl}/${id}`, cfg);
  }

  private authHeaders() {
    const token = this.auth.getToken();
    if (!token) return null;
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }
}
