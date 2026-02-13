import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: false,
})
export class ProductDetailPage implements OnInit {
  product: any = null;

  constructor(
    private route: ActivatedRoute,
    private carritoService: CarritoService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:4800/api/articulos/${id}`);
      const data = await response.json();
      this.product = data?.articulo || null;
    }
  }

  async addToCart() {
    if (!this.product?.idarticulo) {
      const t = await this.toastCtrl.create({ message: 'Artículo no disponible', duration: 2000, color: 'warning' });
      await t.present();
      return;
    }

    try {
      await firstValueFrom(this.carritoService.addItem(this.product.idarticulo, 1));
      const t = await this.toastCtrl.create({ message: 'Añadido al carrito', duration: 1500, color: 'success' });
      await t.present();
    } catch (error: any) {
      const message = error?.error?.message || error?.message || 'No se pudo agregar al carrito';
      const t = await this.toastCtrl.create({ message, duration: 2500, color: 'danger' });
      await t.present();
    }
  }
}
