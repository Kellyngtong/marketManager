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
  idcarrito_item?: number;
  idusuario?: number;
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

const CARRITO_LOCAL_KEY = 'carritoLocal';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private API_HOST = this.getApiHost();
  private baseUrl = `${this.API_HOST}/api/carrito`;

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

  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  private cartTotalsSubject = new BehaviorSubject<CartTotals>(EMPTY_TOTALS);
  cartTotals$ = this.cartTotalsSubject.asObservable();

  constructor(private http: HttpClient, private auth: AuthService) {
    this.auth.user$.subscribe((user) => {
      if (user && !this.isAdminUser(user)) {
        this.refreshCart().subscribe({ next: () => {}, error: () => {} });
      } else {
        // Si no hay usuario, cargar desde localStorage
        this.loadLocalCart();
      }
    });
  }

  refreshCart(): Observable<CartResponse> {
    const cfg = this.authHeaders();
    if (!cfg) {
      this.loadLocalCart();
      return of({ items: this.getLocalCart(), totales: this.calculateTotals(this.getLocalCart()) });
    }

    return this.http.get<CartResponse>(this.baseUrl, cfg).pipe(
      tap((res) => this.handleCartResponse(res))
    );
  }

  addItem(productoId: number, cantidad = 1, articulo?: CartArticulo): Observable<CartResponse> {
    const cfg = this.authHeaders();
    
    if (!cfg) {
      // Si no hay autenticación, agregar a localStorage
      this.addToLocalCart(productoId, cantidad, articulo);
      const items = this.getLocalCart();
      const totales = this.calculateTotals(items);
      this.handleCartResponse({ items, totales });
      return of({ items, totales });
    }

    // Si hay autenticación, agregar al servidor
    return this.http
      .post<CartResponse>(this.baseUrl, { productoId, cantidad }, cfg)
      .pipe(tap((res) => this.handleCartResponse(res)));
  }

  updateItem(itemId: number | undefined, cantidad: number) {
    const cfg = this.authHeaders();
    
    if (!cfg) {
      // SIN autenticación: usar localStorage - itemId es el idarticulo
      if (itemId !== undefined) {
        this.updateLocalCart(itemId, cantidad);
        const items = this.getLocalCart();
        const totales = this.calculateTotals(items);
        this.handleCartResponse({ items, totales });
      }
      return of({ items: this.getLocalCart(), totales: this.calculateTotals(this.getLocalCart()) });
    }

    // CON autenticación: usar servidor - itemId es el idcarrito_item
    // Si itemId es undefined, es un carrito local que no debería estar aquí
    if (itemId === undefined) {
      console.warn('ItemId undefined pero hay token - ignorando actualización');
      return of({ items: [], totales: EMPTY_TOTALS });
    }

    return this.http
      .put<CartResponse>(`${this.baseUrl}/${itemId}`, { cantidad }, cfg)
      .pipe(tap((res) => this.handleCartResponse(res)));
  }

  removeItem(itemId: number | undefined) {
    const cfg = this.authHeaders();
    
    if (!cfg) {
      // SIN autenticación: usar localStorage - itemId es el idarticulo
      if (itemId !== undefined) {
        this.removeFromLocalCart(itemId);
        const items = this.getLocalCart();
        const totales = this.calculateTotals(items);
        this.handleCartResponse({ items, totales });
      }
      return of({ items: this.getLocalCart(), totales: this.calculateTotals(this.getLocalCart()) });
    }

    // CON autenticación: usar servidor - itemId es el idcarrito_item
    // Si itemId es undefined, es un carrito local que no debería estar aquí
    if (itemId === undefined) {
      console.warn('ItemId undefined pero hay token - ignorando eliminación');
      return of({ items: [], totales: EMPTY_TOTALS });
    }

    return this.http
      .delete<CartResponse>(`${this.baseUrl}/${itemId}`, cfg)
      .pipe(tap((res) => this.handleCartResponse(res)));
  }

  clearCart() {
    const cfg = this.authHeaders();
    
    if (!cfg) {
      // Limpiar localStorage
      localStorage.removeItem(CARRITO_LOCAL_KEY);
      this.handleCartResponse({ items: [], totales: EMPTY_TOTALS });
      return of({ items: [], totales: EMPTY_TOTALS });
    }

    return this.http
      .delete<CartResponse>(this.baseUrl, cfg)
      .pipe(tap((res) => this.handleCartResponse(res)));
  }

  getCartSnapshot() {
    return this.cartItemsSubject.value;
  }

  // Métodos privados para carrito local
  private getLocalCart(): CartItem[] {
    const stored = localStorage.getItem(CARRITO_LOCAL_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private addToLocalCart(productoId: number, cantidad: number, articulo?: CartArticulo) {
    const items = this.getLocalCart();
    const existingItem = items.find(item => item.idarticulo === productoId);
    
    if (existingItem) {
      existingItem.cantidad += cantidad;
    } else {
      items.push({
        idarticulo: productoId,
        cantidad,
        articulo
      });
    }
    
    localStorage.setItem(CARRITO_LOCAL_KEY, JSON.stringify(items));
  }

  private updateLocalCart(productoId: number, cantidad: number) {
    const items = this.getLocalCart();
    const item = items.find(i => i.idarticulo === productoId);
    
    if (item) {
      item.cantidad = cantidad;
      localStorage.setItem(CARRITO_LOCAL_KEY, JSON.stringify(items));
    }
  }

  private removeFromLocalCart(productoId: number) {
    let items = this.getLocalCart();
    items = items.filter(i => i.idarticulo !== productoId);
    localStorage.setItem(CARRITO_LOCAL_KEY, JSON.stringify(items));
  }

  private loadLocalCart() {
    const items = this.getLocalCart();
    const totales = this.calculateTotals(items);
    this.handleCartResponse({ items, totales });
  }

  private calculateTotals(items: CartItem[]): CartTotals {
    const subtotal = items.reduce((sum, item) => {
      const precio = item.articulo?.precio_venta || 0;
      return sum + (precio * item.cantidad);
    }, 0);
    
    const tasaImpuesto = 0.21; // 21% IVA
    const impuesto = subtotal * tasaImpuesto;
    const total = subtotal + impuesto;
    
    return { subtotal, impuesto, total, tasaImpuesto };
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

  private isAdminUser(user: any) {
    const topLevelRol = user?.idrol;
    const nestedRol = user?.rol?.idrol;
    const rolNombre = String(user?.rol?.nombre || user?.rol || '').toLowerCase();
    return topLevelRol === 4 || nestedRol === 4 || rolNombre.includes('admin');
  }
}
