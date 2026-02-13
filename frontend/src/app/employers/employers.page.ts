import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { ProductModalComponent } from '../product-modal/product-modal.component';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-employers',
  templateUrl: './employers.page.html',
  styleUrls: ['./employers.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class EmployersPage {
  private readonly API_HOST = `${window.location.protocol}//${window.location.hostname}:4800`;
  products: any[] = [];
  isLoading = false;
  selectedTipo: string | null = null;
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
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private authService: AuthService
  ) {
    this.loadProducts();
  }

  async loadProducts() {
    this.isLoading = true;
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (this.selectedTipo) {
        params.set('tipo', this.selectedTipo);
      }
      const response = await fetch(`${this.API_HOST}/api/articulos?${params.toString()}`);
      if (!response.ok) {
        throw new Error('No se pudo obtener el inventario');
      }
      const data = await response.json();
      this.products = data?.articulos || [];
    } catch (error) {
      console.error('Error loading inventory', error);
      this.presentToast('No se pudo cargar el inventario', 'danger');
    } finally {
      this.isLoading = false;
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

  async openCreateModal() {
    const modal = await this.modalCtrl.create({
      component: ProductModalComponent,
      backdropDismiss: true,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (!data?.product) {
      return;
    }

    const product = data.product;
    const loading = await this.loadingCtrl.create({ message: 'Creando producto...' });
    await loading.present();

    try {
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('Debes iniciar sesión como empleado');
      }

      let imageUrl = product.image || null;
      if (data.file) {
        const uploaded = await this.uploadImage(data.file);
        if (uploaded) {
          imageUrl = uploaded;
        }
      } else if (!product.image && data.previewUrl) {
        imageUrl = data.previewUrl;
      }

      const normalizedTipo = String(product.tipo || '').trim().toLowerCase();
      const payload = {
        codigo: `SKU-${Date.now()}`,
        nombre: product.name,
        descripcion: product.description,
        precio_venta: Number(product.price),
        stock: Number(product.stock),
        imagen: imageUrl,
        idcategoria: this.resolveCategoria(normalizedTipo),
        tipo: normalizedTipo,
        oferta: !!product.oferta,
      };

      const response = await fetch(`${this.API_HOST}/api/articulos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message || 'No se pudo crear el artículo');
      }

      this.presentToast('Artículo creado correctamente', 'success');
      this.loadProducts();
    } catch (error: any) {
      console.error('Error creating article', error);
      this.presentToast(error?.message || 'No se pudo crear el artículo', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async editProduct(product: any) {
    const modal = await this.modalCtrl.create({
      component: ProductModalComponent,
      componentProps: {
        mode: 'edit',
        initialProduct: product,
      },
      backdropDismiss: true,
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (!data?.product) {
      return;
    }

    const edited = data.product;

    try {
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('Debes iniciar sesión como empleado');
      }

      let imageUrl = edited.image || product.imagen || product.image || null;
      if (data.file) {
        const uploaded = await this.uploadImage(data.file);
        if (uploaded) {
          imageUrl = uploaded;
        }
      } else if (!edited.image && data.previewUrl) {
        imageUrl = data.previewUrl;
      }

      const normalizedTipo = String(edited.tipo || '').trim().toLowerCase();

      const payload = {
        nombre: edited.name,
        precio_venta: Number(edited.price),
        stock: Number(edited.stock),
        descripcion: edited.description,
        tipo: normalizedTipo,
        idcategoria: this.resolveCategoria(normalizedTipo),
        imagen: imageUrl,
        oferta: !!edited.oferta,
      };

      const response = await fetch(`${this.API_HOST}/api/articulos/${product.idarticulo || product.id}`, {
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

      this.presentToast('Artículo actualizado', 'success');
      this.loadProducts();
    } catch (error: any) {
      console.error('Error updating article', error);
      this.presentToast(error?.message || 'No se pudo actualizar el artículo', 'danger');
    }
  }

  async deleteProduct(id: number) {
    const confirmed = confirm('¿Eliminar este artículo?');
    if (!confirmed) {
      return;
    }

    try {
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('Debes iniciar sesión como empleado');
      }

      const response = await fetch(`${this.API_HOST}/api/articulos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message || 'No se pudo eliminar el artículo');
      }

      this.presentToast('Artículo eliminado', 'success');
      this.loadProducts();
    } catch (error: any) {
      console.error('Error deleting article', error);
      this.presentToast(error?.message || 'No se pudo eliminar el artículo', 'danger');
    }
  }

  private resolveCategoria(tipo: string) {
    return this.tipoCategoriaMap[tipo] || 1;
  }

  private async uploadImage(file: File) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch(`${this.API_HOST}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data?.imageUrl || null;
    } catch (error) {
      console.error('Error uploading image', error);
      return null;
    }
  }

  private async presentToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color });
    await toast.present();
  }
}
