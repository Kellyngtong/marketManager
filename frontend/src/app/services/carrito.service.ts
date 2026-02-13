import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

export interface CartArticulo {
  idarticulo: number;
  nombre: string;
  precio_venta: number;
  stock: number;
  oferta?: boolean;
  imagen?: string;
  descripcion?: string;
}

export interface CartItem {
  idcarrito_item: number;
  idusuario: number;
  idarticulo: number;
  cantidad: number;
  articulo?: CartArticulo;
}

export interface CartTotals {
  subtotal: number;
  impuesto: number;
  total: number;
  tasaImpuesto: number;
}

interface CartResponse {
  items: CartItem[];
  totales: CartTotals;
}

const EMPTY_TOTALS: CartTotals = {
  subtotal: 0,
  impuesto: 0,
  total: 0,
  tasaImpuesto: 0,
};

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private API_HOST = `${window.location.protocol}//${window.location.hostname}:4800`;
  private baseUrl = `${this.API_HOST}/api/carrito`;

  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  private cartTotalsSubject = new BehaviorSubject<CartTotals>(EMPTY_TOTALS);
  cartTotals$ = this.cartTotalsSubject.asObservable();

  constructor(private http: HttpClient, private auth: AuthService) {
    this.auth.user$.subscribe((user) => {
      if (user) {
        this.refreshCart().subscribe({ next: () => {}, error: () => {} });
      } else {
        this.cartItemsSubject.next([]);
        this.cartTotalsSubject.next(EMPTY_TOTALS);
      }
    });
  }

  refreshCart(): Observable<CartResponse> {
    const cfg = this.authHeaders();
    if (!cfg) {
      this.cartItemsSubject.next([]);
      this.cartTotalsSubject.next(EMPTY_TOTALS);
      return of({ items: [], totales: EMPTY_TOTALS });
    }

    return this.http.get<CartResponse>(this.baseUrl, cfg).pipe(
      tap((res) => this.handleCartResponse(res))
    );
  }

  addItem(productoId: number, cantidad = 1) {
    const cfg = this.authHeaders();
    if (!cfg) {
      return throwError(() => new Error('Debes iniciar sesión para agregar productos'));
    }

    return this.http
      .post<CartResponse>(this.baseUrl, { productoId, cantidad }, cfg)
      .pipe(tap((res) => this.handleCartResponse(res)));
  }

  updateItem(itemId: number, cantidad: number) {
    const cfg = this.authHeaders();
    if (!cfg) {
      return throwError(() => new Error('Debes iniciar sesión para actualizar el carrito'));
    }

    return this.http
      .put<CartResponse>(`${this.baseUrl}/${itemId}`, { cantidad }, cfg)
      .pipe(tap((res) => this.handleCartResponse(res)));
  }

  removeItem(itemId: number) {
    const cfg = this.authHeaders();
    if (!cfg) {
      return throwError(() => new Error('Debes iniciar sesión para actualizar el carrito'));
    }

    return this.http
      .delete<CartResponse>(`${this.baseUrl}/${itemId}`, cfg)
      .pipe(tap((res) => this.handleCartResponse(res)));
  }

  clearCart() {
    const cfg = this.authHeaders();
    if (!cfg) {
      return throwError(() => new Error('Debes iniciar sesión para actualizar el carrito'));
    }

    return this.http
      .delete<CartResponse>(this.baseUrl, cfg)
      .pipe(tap((res) => this.handleCartResponse(res)));
  }

  getCartSnapshot() {
    return this.cartItemsSubject.value;
  }

  private handleCartResponse(res?: Partial<CartResponse>) {
    const items = res?.items || [];
    const totals = res?.totales || EMPTY_TOTALS;
    this.cartItemsSubject.next(items);
    this.cartTotalsSubject.next(totals);
  }

  private authHeaders() {
    const token = this.auth.getToken();
    if (!token) return null;
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }
}
