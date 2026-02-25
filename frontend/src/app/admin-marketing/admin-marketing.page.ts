import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from '../auth/auth.service';
import { ProductImageDirective } from '../directives/product-image.directive';

interface MarketingProduct {
  idarticulo: number;
  nombre: string;
  codigo?: string;
  precio_venta: number;
  oferta: boolean;
  tipo?: string;
  idcategoria?: number;
  stock?: number;
  imagen?: string;
}

@Component({
  selector: 'app-admin-marketing',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ProductImageDirective],
  templateUrl: './admin-marketing.page.html',
  styleUrls: ['./admin-marketing.page.scss'],
})
export class AdminMarketingPage {
  private readonly API_HOST = `${window.location.protocol}//${window.location.hostname}:4800`;
  private readonly originalPricesKey = 'marketing_offer_original_prices_v1';

  products: MarketingProduct[] = [];
  allProducts: MarketingProduct[] = [];
  isLoading = false;
  offerPriceDrafts: Record<number, string> = {};
  selectedTipo: string | null = null;
  searchTerm = '';
  private originalPrices: Record<number, number> = {};

  readonly tipos = [
    { label: 'Todos', value: null },
    { label: 'Fruta', value: 'fruta' },
    { label: 'Verdura', value: 'verdura' },
    { label: 'Embutidos', value: 'embutidos' },
    { label: 'Carne', value: 'carne' },
    { label: 'Pescado', value: 'pescado' },
    { label: 'Bebidas', value: 'bebidas' },
    { label: 'Bebidas alcohólicas', value: 'bebidas alcoholicas' },
    { label: 'Trigo', value: 'trigo' },
  ];

  private readonly tipoCategoriaMap: Record<string, number> = {
    fruta: 1,
    verdura: 2,
    bebidas: 3,
    'bebidas alcoholicas': 8,
    embutidos: 5,
    carne: 6,
    pescado: 7,
    trigo: 9,
  };

  constructor(
    private authService: AuthService,
    private toastCtrl: ToastController,
  ) {
    this.originalPrices = this.loadOriginalPrices();
  }

  ionViewWillEnter() {
    this.loadProducts();
  }

  async loadProducts() {
    this.isLoading = true;
    try {
      const params = new URLSearchParams({ limit: '100' });

      let page = 1;
      let totalPages = 1;
      const fullList: MarketingProduct[] = [];

      while (page <= totalPages) {
        const query = new URLSearchParams(params);
        query.set('page', String(page));
        const response = await fetch(
          `${this.API_HOST}/api/articulos?${query.toString()}`,
        );

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(
            body?.message || 'No se pudo obtener la lista de productos',
          );
        }

        const data = await response.json();
        const articulos = (data?.articulos || []) as MarketingProduct[];
        totalPages = Number(data?.totalPages || 1);
        fullList.push(...articulos);
        page += 1;
      }

      this.allProducts = fullList.sort((a, b) =>
        String(a.nombre || '').localeCompare(String(b.nombre || '')),
      );
      this.applyTipoFilter();

      for (const product of this.allProducts) {
        this.offerPriceDrafts[product.idarticulo] = String(
          Number(product.precio_venta || 0),
        );
      }
    } catch (error: any) {
      console.error('Error loading products for marketing admin', error);
      this.presentToast(
        error?.message || 'No se pudo cargar productos',
        'danger',
      );
    } finally {
      this.isLoading = false;
    }
  }

  selectTipo(value: string | null) {
    if (this.selectedTipo === value) {
      return;
    }
    this.selectedTipo = value;
    this.applyTipoFilter();
  }

  onSearchInput(event: Event | CustomEvent) {
    const customEvent = event as CustomEvent<{ value?: string }>;
    const fromDetail = customEvent?.detail?.value;
    const fromTarget = (event?.target as HTMLInputElement | null)?.value;
    this.searchTerm = String(fromDetail ?? fromTarget ?? '').trim();
    this.applyTipoFilter();
  }

  getTipoLabel(value: string | null) {
    return this.tipos.find((tipo) => tipo.value === value)?.label || 'Todos';
  }

  async onOfertaToggle(product: MarketingProduct, checked: boolean) {
    if (checked) {
      if (this.originalPrices[product.idarticulo] === undefined) {
        this.originalPrices[product.idarticulo] = Number(
          product.precio_venta || 0,
        );
        this.persistOriginalPrices();
      }

      const ok = await this.updateArticulo(product.idarticulo, {
        oferta: true,
      });
      if (!ok) {
        return;
      }

      product.oferta = true;
      this.presentToast(
        'Oferta activada. Ahora puedes fijar el nuevo precio.',
        'success',
      );
      return;
    }

    const originalPrice = this.originalPrices[product.idarticulo];
    const restorePrice = Number.isFinite(Number(originalPrice))
      ? Number(originalPrice)
      : Number(product.precio_venta || 0);

    const ok = await this.updateArticulo(product.idarticulo, {
      oferta: false,
      precio_venta: restorePrice,
    });
    if (!ok) {
      return;
    }

    product.oferta = false;
    product.precio_venta = restorePrice;
    this.offerPriceDrafts[product.idarticulo] = String(restorePrice);
    delete this.originalPrices[product.idarticulo];
    this.persistOriginalPrices();
    this.presentToast('Oferta desactivada y precio restaurado', 'success');
  }

  async saveOfferPrice(product: MarketingProduct) {
    const raw = this.offerPriceDrafts[product.idarticulo];
    const newPrice = Number(raw);
    if (!raw || Number.isNaN(newPrice) || newPrice <= 0) {
      this.presentToast('Ingresa un precio de oferta válido', 'warning');
      return;
    }

    if (!product.oferta) {
      const enabled = await this.updateArticulo(product.idarticulo, {
        oferta: true,
      });
      if (!enabled) {
        return;
      }
      product.oferta = true;
    }

    if (this.originalPrices[product.idarticulo] === undefined) {
      this.originalPrices[product.idarticulo] = Number(
        product.precio_venta || 0,
      );
      this.persistOriginalPrices();
    }

    const ok = await this.updateArticulo(product.idarticulo, {
      oferta: true,
      precio_venta: newPrice,
    });

    if (!ok) {
      return;
    }

    product.oferta = true;
    product.precio_venta = newPrice;
    this.presentToast('Precio de oferta actualizado', 'success');
  }

  trackByProduct(_: number, product: MarketingProduct) {
    return product.idarticulo;
  }

  private applyTipoFilter() {
    const normalizedSearch = this.normalizeText(this.searchTerm);

    if (!this.selectedTipo) {
      this.products = this.allProducts.filter((product) => {
        const productName = this.normalizeText(product?.nombre);
        return normalizedSearch ? productName.includes(normalizedSearch) : true;
      });
      return;
    }

    const selected = String(this.selectedTipo).trim().toLowerCase();
    const expectedCategory = this.tipoCategoriaMap[selected];

    this.products = this.allProducts.filter((product) => {
      const productTipo = String(product?.tipo || '')
        .trim()
        .toLowerCase();
      const matchesTipo =
        productTipo === selected ||
        (Number(product?.idcategoria) === expectedCategory &&
          !!expectedCategory);
      if (!matchesTipo) {
        return false;
      }

      const productName = this.normalizeText(product?.nombre);
      return normalizedSearch ? productName.includes(normalizedSearch) : true;
    });
  }

  private normalizeText(value: any) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private async updateArticulo(id: number, payload: Record<string, any>) {
    try {
      const token = this.authService.getToken();
      if (!token) {
        throw new Error(
          'Debes iniciar sesión como admin para gestionar ofertas',
        );
      }

      const response = await fetch(`${this.API_HOST}/api/articulos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message || 'No se pudo actualizar el artículo');
      }

      return true;
    } catch (error: any) {
      console.error('Error updating articulo from marketing admin', error);
      this.presentToast(
        error?.message || 'No se pudo guardar el cambio',
        'danger',
      );
      return false;
    }
  }

  private loadOriginalPrices(): Record<number, number> {
    try {
      const raw = localStorage.getItem(this.originalPricesKey);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  private persistOriginalPrices() {
    localStorage.setItem(
      this.originalPricesKey,
      JSON.stringify(this.originalPrices),
    );
  }

  private async presentToast(
    message: string,
    color: 'success' | 'danger' | 'warning',
  ) {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 1800,
    });
    await toast.present();
  }
}
