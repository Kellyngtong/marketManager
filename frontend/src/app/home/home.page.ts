import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { firstValueFrom, Subscription } from 'rxjs';
import { CarritoService } from '../services/carrito.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnDestroy {
  @ViewChild('avatarInput') avatarInput?: ElementRef<HTMLInputElement>;
  private API_HOST = `${window.location.protocol}//${window.location.hostname}:4800`;
  goToDetail(payload: any) {
    const targetId = typeof payload === 'object' ? payload?.idarticulo || payload?.id : payload;
    if (targetId) {
      window.location.href = `/product/${targetId}`;
    }
  }

  products: any[] = [];
  clientName = 'Cliente';
  clientAvatar: string | null = null;
  cartItemsCount = 0;
  private cartCountByArticulo: Record<number, number> = {};
  selectedTipo: string | null = null;
  isUploadingAvatar = false;
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
    embutidos: 5,
    carne: 6,
    pescado: 7,
    'bebidas alcoholicas': 8,
    trigo: 9,
  };
  private subscriptions = new Subscription();

  constructor(
    private toastCtrl: ToastController,
    private carritoService: CarritoService,
    private authService: AuthService,
    private router: Router
  ) {
    this.subscriptions.add(
      this.authService.user$.subscribe((user) => {
        this.clientName = user?.nombre || user?.username || 'Cliente';
        this.clientAvatar = user?.avatar || null;
      })
    );

    this.subscriptions.add(
      this.carritoService.cartItems$.subscribe((items) => {
        const byArticulo: Record<number, number> = {};
        (items || []).forEach((item) => {
          const id = Number(item?.idarticulo);
          if (!Number.isNaN(id) && id > 0) {
            byArticulo[id] = (byArticulo[id] || 0) + (Number(item?.cantidad) || 0);
          }
        });

        this.cartCountByArticulo = byArticulo;
        this.cartItemsCount = (items || []).reduce(
          (acc, item) => acc + (Number(item?.cantidad) || 0),
          0
        );
      })
    );

    this.loadProducts();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async loadProducts() {
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (this.selectedTipo) {
        const categoria = this.tipoCategoriaMap[this.selectedTipo];
        if (categoria) {
          params.set('idcategoria', String(categoria));
        } else {
          params.set('tipo', this.selectedTipo);
        }
      }
      const response = await fetch(`${this.API_HOST}/api/articulos?${params.toString()}`);
      if (!response.ok) {
        throw new Error('No se pudo obtener la lista de artículos');
      }
      const data = await response.json();
      this.products = data?.articulos || [];
    } catch (error) {
      console.error('Error loading products:', error);
      const t = await this.toastCtrl.create({ message: 'No se pudieron cargar los artículos', duration: 2500, color: 'danger' });
      await t.present();
    }
  }

  async addToCart(event: { product: any; quantity: number }) {
    const producto = event?.product;
    const cantidad = Math.max(1, event?.quantity || 1);
    const articuloId = producto?.idarticulo || producto?.id;
    if (!articuloId) {
      const t = await this.toastCtrl.create({ message: 'Artículo no válido para el carrito', duration: 2500, color: 'warning' });
      await t.present();
      return;
    }

    try {
      await firstValueFrom(this.carritoService.addItem(articuloId, cantidad));
      const t = await this.toastCtrl.create({ message: 'Producto añadido al carrito', duration: 1500, color: 'success' });
      await t.present();
    } catch (error: any) {
      const message = this.resolveError(error) || 'No se pudo añadir al carrito';
      const t = await this.toastCtrl.create({ message, duration: 2500, color: 'danger' });
      await t.present();
    }
  }

  selectTipo(value: string | null) {
    if (this.selectedTipo === value) {
      return;
    }
    this.selectedTipo = value;
    this.loadProducts();
  }

  getTipoLabel(value: string | null) {
    return this.tipos.find((tipo) => tipo.value === value)?.label || 'Todos';
  }

  triggerAvatarPicker() {
    this.avatarInput?.nativeElement?.click();
  }

  async onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const MAX = 2 * 1024 * 1024;
    if (file.size > MAX) {
      const warn = await this.toastCtrl.create({
        message: 'La imagen es demasiado grande (máximo 2MB).',
        duration: 3000,
        color: 'warning',
      });
      await warn.present();
      input.value = '';
      return;
    }

    this.isUploadingAvatar = true;
    try {
      let avatarUrl: string | null = null;

      try {
        const uploadRes: any = await firstValueFrom(this.authService.uploadAvatar(file));
        avatarUrl = uploadRes?.imageUrl || uploadRes?.url || null;
      } catch (uploadError: any) {
        avatarUrl = await this.fileToDataUrl(file);
      }

      if (!avatarUrl) {
        throw new Error('No se pudo subir la foto');
      }

      try {
        await firstValueFrom(this.authService.updateProfile({ avatar: avatarUrl }));
      } catch (profileError) {
        this.authService.updateLocalUser({ avatar: avatarUrl });
      }

      this.clientAvatar = avatarUrl;

      const toast = await this.toastCtrl.create({
        message: 'Foto de perfil actualizada',
        duration: 2000,
        color: 'success',
      });
      await toast.present();
    } catch (error: any) {
      console.error('Error updating avatar', error);
      const msg =
        error?.error?.message ||
        error?.message ||
        'No se pudo actualizar la foto de perfil';
      const toast = await this.toastCtrl.create({
        message: msg,
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.isUploadingAvatar = false;
      input.value = '';
    }
  }

  onAvatarImageError() {
    this.clientAvatar = null;
    this.authService.updateLocalUser({ avatar: null });
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  private resolveError(err: any) {
    return (
      err?.error?.message ||
      err?.error?.error ||
      err?.message ||
      null
    );
  }

  get cartBadgeLabel() {
    return this.cartItemsCount > 99 ? '99+' : String(this.cartItemsCount);
  }

  getProductCartCount(product: any) {
    const id = Number(product?.idarticulo || product?.id);
    if (Number.isNaN(id) || id <= 0) {
      return 0;
    }
    return this.cartCountByArticulo[id] || 0;
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          resolve(result);
          return;
        }
        reject(new Error('No se pudo leer la imagen'));
      };
      reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
      reader.readAsDataURL(file);
    });
  }
}
