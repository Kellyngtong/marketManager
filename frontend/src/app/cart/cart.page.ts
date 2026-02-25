import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CarritoService, CartItem } from '../services/carrito.service';
import { ProductImageService } from '../services/product-image.service';

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
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    public imageService: ProductImageService,
  ) {}

  handleImageError(event: Event, productName: string): void {
    const img = event.target as HTMLImageElement;
    const localUrl = this.imageService.getLocalImageUrl(productName);
    if (localUrl && img.src !== localUrl) {
      img.src = localUrl;
    } else {
      img.src = this.imageService.getProductImage(productName);
    }
  }

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
      // Si hay idcarrito_item (usuario autenticado, carrito del servidor), usar eso
      // Si no, usar idarticulo (carrito local)
      const itemId = item.idcarrito_item ?? item.idarticulo;
      await firstValueFrom(this.carritoService.updateItem(itemId, cantidad));
    } catch (error) {
      await this.presentError(error);
    }
  }

  async removeItem(item: CartItem) {
    try {
      // Si hay idcarrito_item (usuario autenticado, carrito del servidor), usar eso
      // Si no, usar idarticulo (carrito local)
      const itemId = item.idcarrito_item ?? item.idarticulo;
      await firstValueFrom(this.carritoService.removeItem(itemId));
      const t = await this.toastCtrl.create({
        message: 'Producto eliminado del carrito',
        duration: 1500,
        color: 'success',
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
      const t = await this.toastCtrl.create({
        message: 'Carrito vaciado',
        duration: 1500,
        color: 'medium',
      });
      await t.present();
    } catch (error) {
      await this.presentError(error);
    }
  }

  async handleCheckout() {
    // Verificar si el usuario está autenticado
    const user = this.auth.getProfile();
    if (!user) {
      // Redirigir a login si no hay usuario
      this.router.navigateByUrl('/login');
      return;
    }

    // Si está autenticado, ir a checkout
    this.router.navigateByUrl('/checkout');
  }

  trackByItem(_: number, item: CartItem) {
    return item.idcarrito_item;
  }

  getShoppingRoute(): string {
    const user = this.auth.currentUserValue;
    const topLevelRol = user?.idrol;
    const nestedRol = user?.rol?.idrol;
    const rolNombre = String(
      user?.rol?.nombre || user?.rol || '',
    ).toLowerCase();
    const isPremium =
      topLevelRol === 2 || nestedRol === 2 || rolNombre.includes('premium');

    return isPremium ? '/cliente-premium' : '/home';
  }

  private async presentError(error: any) {
    const message =
      error?.error?.message ||
      error?.error?.error ||
      error?.message ||
      'Ocurrió un error con el carrito';
    const t = await this.toastCtrl.create({
      message,
      duration: 2500,
      color: 'danger',
    });
    await t.present();
  }
}
