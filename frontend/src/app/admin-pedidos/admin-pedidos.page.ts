import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AlertController,
  IonicModule,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { AuthService } from '../auth/auth.service';

type EstadoPedido = 'NUEVO' | 'PENDIENTE' | 'ENVIADA' | 'CERRADA';

interface OrderItem {
  iddetalle_venta: number;
  idarticulo: number;
  nombre: string;
  cantidad: number;
  precio: number;
  descuento?: number;
}

interface AdminOrder {
  idventa: number;
  idusuario: number;
  idcliente: number;
  usuarioNombre?: string;
  clienteNombre?: string;
  clienteDireccion?: string;
  clienteTelefono?: string;
  total: number;
  fecha_hora: string;
  estado: EstadoPedido | 'ENVIADA' | 'CERRADA';
  items?: OrderItem[];
}

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './admin-pedidos.page.html',
  styleUrls: ['./admin-pedidos.page.scss'],
})
export class AdminPedidosPage {
  private readonly API_HOST = `${window.location.protocol}//${window.location.hostname}:4800`;
  orders: AdminOrder[] = [];
  isLoading = false;
  isEditModalOpen = false;
  editingOrder: AdminOrder | null = null;
  editDraft: {
    clienteNombre: string;
    clienteDireccion: string;
    clienteTelefono: string;
    total: number;
    fecha_hora: string;
    estado: EstadoPedido;
  } = {
    clienteNombre: '',
    clienteDireccion: '',
    clienteTelefono: '',
    total: 0,
    fecha_hora: '',
    estado: 'NUEVO',
  };

  constructor(
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
  ) {
    this.loadOrders();
  }

  async loadOrders() {
    this.isLoading = true;
    try {
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('Debes iniciar sesión');
      }

      const response = await fetch(`${this.API_HOST}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message || 'No se pudo cargar pedidos');
      }

      const data = await response.json();
      this.orders = (data || []).map((order: any) => ({
        ...order,
        total: Number(order.total || 0),
        estado: this.normalizeEstado(order.estado),
        items: Array.isArray(order.items) ? order.items : [],
      }));
    } catch (error: any) {
      console.error('Error loading orders', error);
      this.presentToast(error?.message || 'No se pudieron cargar los pedidos', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async openCreateOrder() {
    const alert = await this.alertCtrl.create({
      header: 'Nuevo pedido',
      inputs: [
        { name: 'idcliente', type: 'number', placeholder: 'ID Cliente' },
        { name: 'idusuario', type: 'number', placeholder: 'ID Usuario (opcional)' },
        { name: 'total', type: 'number', placeholder: 'Total (€)' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: async (values) => {
            await this.createOrder(values);
          },
        },
      ],
    });

    await alert.present();
  }

  editOrder(order: AdminOrder) {
    this.editingOrder = order;
    this.editDraft = {
      clienteNombre: order.clienteNombre || '',
      clienteDireccion: order.clienteDireccion || '',
      clienteTelefono: order.clienteTelefono || '',
      total: Number(order.total || 0),
      fecha_hora: this.toLocalDateTime(order.fecha_hora),
      estado: this.normalizeEstado(order.estado),
    };
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.editingOrder = null;
  }

  async markAsSent(order: AdminOrder) {
    await this.updateOrder(order.idventa, { estado: 'ENVIADA' });
  }

  async markAsPending(order: AdminOrder) {
    await this.updateOrder(order.idventa, { estado: 'PENDIENTE' });
  }

  async markAsClosed(order: AdminOrder) {
    await this.updateOrder(order.idventa, { estado: 'CERRADA' });
  }

  canSend(order: AdminOrder) {
    return order.estado === 'PENDIENTE';
  }

  canMoveToPending(order: AdminOrder) {
    return order.estado === 'NUEVO';
  }

  canClose(order: AdminOrder) {
    return order.estado === 'ENVIADA';
  }

  getEstadoLabel(estado: AdminOrder['estado']) {
    return this.normalizeEstado(estado);
  }

  getEstadoClass(estado: AdminOrder['estado']) {
    const normalized = this.normalizeEstado(estado);
    if (normalized === 'NUEVO') {
      return 'status-nuevo';
    }
    if (normalized === 'PENDIENTE') {
      return 'status-pendiente';
    }
    if (normalized === 'ENVIADA') {
      return 'status-enviada';
    }
    return 'status-cerrada';
  }

  formatDate(value: string) {
    return new Date(value).toLocaleString('es-ES');
  }

  getItemsSummary(items?: OrderItem[]) {
    if (!Array.isArray(items) || !items.length) {
      return 'Sin artículos';
    }

    return items
      .map((item) => `${Number(item.cantidad || 0)} x ${item.nombre || `Artículo #${item.idarticulo}`}`)
      .join(', ');
  }

  async saveEditOrder() {
    if (!this.editingOrder) {
      return;
    }

    await this.updateOrder(this.editingOrder.idventa, {
      clienteNombre: this.editDraft.clienteNombre,
      clienteDireccion: this.editDraft.clienteDireccion,
      clienteTelefono: this.editDraft.clienteTelefono,
      total: Number(this.editDraft.total),
      estado: this.editDraft.estado,
    } as any);

    this.closeEditModal();
  }

  private async createOrder(values: any) {
    const token = this.authService.getToken();
    if (!token) {
      this.presentToast('Debes iniciar sesión', 'danger');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Creando pedido...' });
    await loading.present();

    try {
      const payload = {
        idcliente: Number(values.idcliente),
        idusuario: values.idusuario ? Number(values.idusuario) : undefined,
        total: Number(values.total),
        estado: 'NUEVO',
      };

      const response = await fetch(`${this.API_HOST}/api/admin/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message || 'No se pudo crear el pedido');
      }

      this.presentToast('Pedido creado', 'success');
      await this.loadOrders();
    } catch (error: any) {
      this.presentToast(error?.message || 'No se pudo crear el pedido', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  private async updateOrder(idventa: number, payload: Partial<AdminOrder>) {
    const token = this.authService.getToken();
    if (!token) {
      this.presentToast('Debes iniciar sesión', 'danger');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Actualizando pedido...' });
    await loading.present();

    try {
      const response = await fetch(`${this.API_HOST}/api/admin/orders/${idventa}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message || 'No se pudo actualizar el pedido');
      }

      this.presentToast('Pedido actualizado', 'success');
      await this.loadOrders();
    } catch (error: any) {
      this.presentToast(error?.message || 'No se pudo actualizar el pedido', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  private async presentToast(
    message: string,
    color: 'success' | 'danger' | 'warning' = 'success',
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2200,
      color,
    });
    await toast.present();
  }

  private normalizeEstado(value: any): EstadoPedido {
    const normalized = String(value || '')
      .trim()
      .toUpperCase();

    if (['NUEVO', 'NUEVA'].includes(normalized)) {
      return 'NUEVO';
    }

    if (['ENVIADO', 'ENVIADA'].includes(normalized)) {
      return 'ENVIADA';
    }

    if (['CERRADO', 'CERRADA'].includes(normalized)) {
      return 'CERRADA';
    }

    if (['PENDIENTE'].includes(normalized)) {
      return 'PENDIENTE';
    }

    return 'NUEVO';
  }

  private toLocalDateTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const pad = (num: number) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
