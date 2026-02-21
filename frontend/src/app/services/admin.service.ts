import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private API_HOST = `${window.location.protocol}//${window.location.hostname}:4800`;
  private base = `${this.API_HOST}/api`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders();
    if (token) {
      return headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Métricas del Dashboard
  getDashboardMetrics(): Observable<any> {
    return this.http.get(`${this.base}/admin/metrics`, { headers: this.getHeaders() });
  }

  // Usuarios
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.base}/admin/users`, { headers: this.getHeaders() });
  }

  updateUser(userId: number, userData: any): Observable<any> {
    return this.http.put(`${this.base}/admin/users/${userId}`, userData, { headers: this.getHeaders() });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.base}/admin/users/${userId}`, { headers: this.getHeaders() });
  }

  // Productos
  getAllProducts(): Observable<any> {
    return this.http.get(`${this.base}/admin/products`, { headers: this.getHeaders() });
  }

  createProduct(productData: any): Observable<any> {
    return this.http.post(`${this.base}/admin/products`, productData, { headers: this.getHeaders() });
  }

  updateProduct(productId: number, productData: any): Observable<any> {
    return this.http.put(`${this.base}/admin/products/${productId}`, productData, { headers: this.getHeaders() });
  }

  deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.base}/admin/products/${productId}`, { headers: this.getHeaders() });
  }

  // Pedidos
  getAllOrders(): Observable<any> {
    return this.http.get(`${this.base}/admin/orders`, { headers: this.getHeaders() });
  }

  getOrderDetails(orderId: number): Observable<any> {
    return this.http.get(`${this.base}/admin/orders/${orderId}`, { headers: this.getHeaders() });
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(`${this.base}/admin/orders/${orderId}`, { estado: status }, { headers: this.getHeaders() });
  }
}
