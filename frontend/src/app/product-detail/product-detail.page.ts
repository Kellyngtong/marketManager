import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  quantity: number = 1;
  relatedProducts: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carritoService: CarritoService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
        const response = await fetch(`${window.location.protocol}//${window.location.hostname}:4800/api/articulos/${id}`);
        const data = await response.json();
        this.product = data?.articulo || null;
        
        // Load related products from same category
        if (this.product?.categoria) {
          await this.loadRelatedProducts(this.product.categoria, id);
        }
      } catch (error) {
        console.error('Error loading product:', error);
      }
    }
  }

  async loadRelatedProducts(category: string, currentId: string) {
    try {
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:4800/api/articulos?categoria=${category}`);
      const data = await response.json();
      this.relatedProducts = (data?.articulos || [])
        .filter((p: any) => p.idarticulo !== currentId)
        .slice(0, 4);
    } catch (error) {
      console.error('Error loading related products:', error);
    }
  }

  get finalPrice(): number {
    if (!this.product) return 0;
    const discount = this.product.descuento || 0;
    return this.product.precio_venta * (1 - discount / 100);
  }

  get totalPrice(): number {
    return this.finalPrice * this.quantity;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  incrementQuantity(): void {
    this.quantity++;
  }

  async addToCart() {
    if (!this.product?.idarticulo) {
      const t = await this.toastCtrl.create({ 
        message: 'Artículo no disponible', 
        duration: 2000, 
        color: 'warning' 
      });
      await t.present();
      return;
    }

    try {
      const articulo = {
        idarticulo: this.product.idarticulo,
        nombre: this.product.nombre,
        precio_venta: this.product.precio_venta,
        stock: this.product.stock,
        oferta: this.product.oferta,
        imagen: this.product.imagen,
        descripcion: this.product.descripcion
      };
      for (let i = 0; i < this.quantity; i++) {
        await firstValueFrom(this.carritoService.addItem(this.product.idarticulo, 1, articulo));
      }
      const t = await this.toastCtrl.create({ 
        message: `${this.quantity} x ${this.product.nombre} añadido al carrito`, 
        duration: 1500, 
        color: 'success' 
      });
      await t.present();
      this.quantity = 1;
    } catch (error: any) {
      const message = error?.error?.message || error?.message || 'No se pudo agregar al carrito';
      const t = await this.toastCtrl.create({ message, duration: 2500, color: 'danger' });
      await t.present();
    }
  }

  goBack(): void {
    this.router.navigate(['/productos']);
  }
}
