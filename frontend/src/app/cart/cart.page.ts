import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CarritoService, CartItem } from '../services/carrito.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: false,
})
export class CartPage {
  cartItems$ = this.carritoService.cartItems$;
  totals$ = this.carritoService.cartTotals$;
  user$ = this.auth.user$;

  constructor(
    private carritoService: CarritoService,
    private toastCtrl: ToastController,
    private auth: AuthService,
    private router: Router
  ) {}

  ionViewWillEnter() {
    this.refreshCart();
  }

  async refreshCart(event?: any) {
    try {
      await firstValueFrom(this.carritoService.refreshCart());
    } catch (error) {
      await this.presentError(error);
    } finally {
      event?.target?.complete();
    }
  }

  async increment(item: CartItem) {
    await this.updateItem(item, item.cantidad + 1);
  }

  async decrement(item: CartItem) {
    const nextQty = item.cantidad - 1;
    if (nextQty <= 0) {
      await this.removeItem(item);
    } else {
      await this.updateItem(item, nextQty);
    }
  }

  async updateItem(item: CartItem, cantidad: number) {
    try {
      await firstValueFrom(this.carritoService.updateItem(item.idcarrito_item, cantidad));
    } catch (error) {
      await this.presentError(error);
    }
  }

  async removeItem(item: CartItem) {
    try {
      await firstValueFrom(this.carritoService.removeItem(item.idcarrito_item));
      const t = await this.toastCtrl.create({ 
        message: 'Producto eliminado del carrito', 
        duration: 1500, 
        color: 'success' 
      });
      await t.present();
    } catch (error) {
      await this.presentError(error);
    }
  }

  async clearCart() {
    if (!confirm('¿Vaciar el carrito completo?')) {
      return;
    }

    try {
      await firstValueFrom(this.carritoService.clearCart());
      const t = await this.toastCtrl.create({ message: 'Carrito vaciado', duration: 1500, color: 'medium' });
      await t.present();
    } catch (error) {
      await this.presentError(error);
    }
  }

  async handleCheckout() {
    const t = await this.toastCtrl.create({
      message: '¡Pedido realizado con éxito!',
      duration: 2000,
      color: 'success'
    });
    await t.present();
    await firstValueFrom(this.carritoService.clearCart());
    this.router.navigateByUrl('/home');
  }

  trackByItem(_: number, item: CartItem) {
    return item.idcarrito_item;
  }

  private async presentError(error: any) {
    const message =
      error?.error?.message ||
      error?.error?.error ||
      error?.message ||
      'Ocurrió un error con el carrito';
    const t = await this.toastCtrl.create({ message, duration: 2500, color: 'danger' });
    await t.present();
  }
}
