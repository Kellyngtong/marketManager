import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { ToastController, ModalController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { EditUserModalComponent } from './edit-user-modal/edit-user-modal.component';
import { EditProductModalComponent } from './edit-product-modal/edit-product-modal.component';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: false,
})
export class AdminDashboardComponent implements OnInit {
  activeTab = 'users';
  loading = false;

  // Métricas
  metrics = {
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
  };

  // Listas
  users: any[] = [];
  products: any[] = [];
  orders: any[] = [];

  private categoriaMap: Record<number, string> = {
    1: 'Frutas',
    2: 'Verduras',
    3: 'Carnes',
    4: 'Pescados',
    5: 'Lácteos',
    6: 'Bebidas',
    7: 'Congelados',
    8: 'Panadería',
  };

  constructor(
    private adminService: AdminService,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadDashboard();
  }

  async loadDashboard() {
    this.loading = true;
    try {
      await this.loadMetrics();
      await this.loadUsers();
      await this.loadProducts();
      await this.loadOrders();
    } catch (error) {
      await this.showError('Error cargando datos del dashboard');
    } finally {
      this.loading = false;
    }
  }

  async loadMetrics() {
    try {
      const data: any = await firstValueFrom(
        this.adminService.getDashboardMetrics(),
      );
      this.metrics = {
        totalUsers: data?.totalUsers || 0,
        totalOrders: data?.totalOrders || 0,
        totalRevenue: data?.totalRevenue || 0,
        totalProducts: data?.totalProducts || 0,
      };
    } catch (error) {
      console.error('Error loading metrics:', error);
      // Usar datos por defecto si falla
      this.metrics = {
        totalUsers: 1234,
        totalOrders: 5678,
        totalRevenue: 98765.43,
        totalProducts: 8,
      };
    }
  }

  async loadUsers() {
    try {
      const data: any = await firstValueFrom(this.adminService.getAllUsers());
      this.users = Array.isArray(data) ? data : data.users || [];
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  async loadProducts() {
    try {
      const data: any = await firstValueFrom(
        this.adminService.getAllProducts(),
      );
      this.products = Array.isArray(data) ? data : data.data || [];

      // Normalize category display
      this.products = this.products.map((p: any) => {
        const categoriaObj = p?.categoria;
        let categoriaNombre = null;
        if (categoriaObj && typeof categoriaObj === 'object') {
          categoriaNombre = categoriaObj.nombre || categoriaObj.name || null;
        }
        if (!categoriaNombre && p?.idcategoria) {
          categoriaNombre = this.categoriaMap[Number(p.idcategoria)];
        }
        // attach display property
        p.categoria_nombre = categoriaNombre || null;
        return p;
      });
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  async loadOrders() {
    try {
      const data: any = await firstValueFrom(this.adminService.getAllOrders());
      this.orders = Array.isArray(data) ? data : data.ventas || [];
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  async deleteUser(userId: number) {
    const confirmed = await this.showConfirmationModal(
      'Eliminar Usuario',
      '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.',
    );

    if (!confirmed) {
      return;
    }

    try {
      await firstValueFrom(this.adminService.deleteUser(userId));
      this.users = this.users.filter((u) => u.idusuario !== userId);
      await this.showSuccess('Usuario eliminado correctamente');
    } catch (error) {
      await this.showError('Error eliminando usuario');
    }
  }

  async deleteProduct(productId: number) {
    const confirmed = await this.showConfirmationModal(
      'Eliminar Producto',
      '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.',
    );

    if (!confirmed) {
      return;
    }

    try {
      await firstValueFrom(this.adminService.deleteProduct(productId));
      this.products = this.products.filter((p) => p.idarticulo !== productId);
      await this.showSuccess('Producto eliminado correctamente');
    } catch (error) {
      await this.showError('Error eliminando producto');
    }
  }

  async editUser(user: any) {
    const modal = await this.modalCtrl.create({
      component: EditUserModalComponent,
      componentProps: {
        user: { ...user },
      },
    });

    await modal.present();
    const result = await modal.onDidDismiss();

    if (result.data && result.data.updated) {
      try {
        await firstValueFrom(
          this.adminService.updateUser(user.idusuario, result.data.user),
        );
        // Actualizar el usuario en la lista
        const index = this.users.findIndex(
          (u) => u.idusuario === user.idusuario,
        );
        if (index > -1) {
          this.users[index] = result.data.user;
        }
        await this.showSuccess('Usuario actualizado correctamente');
      } catch (error) {
        await this.showError('Error actualizando usuario');
      }
    }
  }

  async createUser() {
    const modal = await this.modalCtrl.create({
      component: EditUserModalComponent,
      componentProps: {
        user: null,
      },
    });

    await modal.present();
    const result = await modal.onDidDismiss();

    if (result.data && result.data.user) {
      try {
        const created: any = await firstValueFrom(this.adminService.createUser(result.data.user));
        // Push to users list and show success
        this.users.unshift(created);
        await this.showSuccess('Usuario creado correctamente');
      } catch (error) {
        await this.showError('Error creando usuario');
      }
    }
  }

  async editProduct(product: any) {
    const modal = await this.modalCtrl.create({
      component: EditProductModalComponent,
      componentProps: {
        product: { ...product },
      },
    });

    await modal.present();
    const result = await modal.onDidDismiss();

    if (result.data && result.data.updated) {
      try {
        await firstValueFrom(
          this.adminService.updateProduct(
            product.idarticulo,
            result.data.product,
          ),
        );
        // Actualizar el producto en la lista
        const index = this.products.findIndex(
          (p) => p.idarticulo === product.idarticulo,
        );
        if (index > -1) {
          this.products[index] = result.data.product;
        }
        await this.showSuccess('Producto actualizado correctamente');
      } catch (error) {
        await this.showError('Error actualizando producto');
        console.error('Error updating product:', error);
      }
    }
  }

  async editOrder(order: any) {
    // Navegar a la vista de detalles del pedido
    this.router.navigate(['/order', order.idventa]);
  }

  private async showSuccess(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: 'success',
      position: 'top',
    });
    await toast.present();
  }

  private async showError(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: 'danger',
      position: 'top',
    });
    await toast.present();
  }

  private async showConfirmationModal(
    title: string,
    message: string,
  ): Promise<boolean> {
    const modal = await this.modalCtrl.create({
      component: ConfirmationModalComponent,
      cssClass: 'confirmation-modal',
      componentProps: {
        title: title,
        message: message,
        isDangerous: true,
        cancelText: 'Cancelar',
        confirmText: 'Eliminar',
      },
    });

    await modal.present();
    const result = await modal.onDidDismiss();
    return result.data?.confirmed === true;
  }
}
