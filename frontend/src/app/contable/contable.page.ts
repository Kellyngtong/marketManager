import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from '../auth/auth.service';

interface ContableItem {
  nombre: string;
  cantidad: number;
  precio: number;
}

interface ContableCompra {
  idventa: number;
  fecha: string;
  tipoCliente: 'CLIENTE BASE' | 'CLIENTE PREMIUM';
  items: ContableItem[];
  total: number;
}

@Component({
  selector: 'app-contable',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './contable.page.html',
  styleUrls: ['./contable.page.scss'],
})
export class ContablePage {
  private readonly API_HOST = `${window.location.protocol}//${window.location.hostname}:4800`;
  private readonly seenStorageKey = 'contable_seen_sales_v1';

  compras: ContableCompra[] = [];
  isLoading = false;
  private seenByVentaId: Record<number, boolean> = {};

  constructor(
    private auth: AuthService,
    private toastCtrl: ToastController,
  ) {}

  ionViewWillEnter() {
    this.loadSeenState();
    this.loadCompras();
  }

  async loadCompras(event?: any) {
    if (!event) {
      this.isLoading = true;
    }

    try {
      const token = this.auth.getToken();
      if (!token) {
        throw new Error('Debes iniciar sesión para acceder al módulo contable');
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [ordersRes, usersRes] = await Promise.all([
        fetch(`${this.API_HOST}/api/admin/orders`, { headers }),
        fetch(`${this.API_HOST}/api/admin/users`, { headers }),
      ]);

      if (!ordersRes.ok) {
        throw new Error('No se pudieron cargar las compras');
      }

      const ordersData = await ordersRes.json();
      const usersData = usersRes.ok ? await usersRes.json() : [];

      const usersById = new Map<number, any>();
      (Array.isArray(usersData) ? usersData : []).forEach((user: any) => {
        const userId = Number(user?.idusuario);
        if (Number.isFinite(userId) && userId > 0) {
          usersById.set(userId, user);
        }
      });

      this.compras = (Array.isArray(ordersData) ? ordersData : []).map(
        (order: any) => {
          const userId = Number(order?.idusuario);
          const user = usersById.get(userId);

          const rolNombre = String(user?.rol || '').trim().toLowerCase();
          const isPremium =
            Number(user?.idrol) === 2 || rolNombre.includes('premium');

          const items = (Array.isArray(order?.items) ? order.items : []).map(
            (item: any) => ({
              nombre: String(item?.nombre || 'Producto'),
              cantidad: Math.max(0, Number(item?.cantidad || 0)),
              precio: Number(item?.precio || 0),
            }),
          );

          const totalFromItems = items.reduce(
            (acc: number, item: ContableItem) =>
              acc + item.cantidad * item.precio,
            0,
          );

          return {
            idventa: Number(order?.idventa || 0),
            fecha: String(order?.fecha_hora || ''),
            tipoCliente: isPremium ? 'CLIENTE PREMIUM' : 'CLIENTE BASE',
            items,
            total: Number(order?.total || totalFromItems || 0),
          } as ContableCompra;
        },
      );
    } catch (error: any) {
      console.error('Error loading accounting purchases', error);
      const toast = await this.toastCtrl.create({
        message: error?.message || 'No se pudo cargar el listado de compras',
        duration: 2500,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.isLoading = false;
      event?.target?.complete?.();
    }
  }

  isSeen(idventa: number) {
    return !!this.seenByVentaId[idventa];
  }

  toggleSeen(idventa: number) {
    const current = !!this.seenByVentaId[idventa];
    this.seenByVentaId[idventa] = !current;
    this.persistSeenState();
  }

  trackByCompra(_: number, compra: ContableCompra) {
    return compra.idventa;
  }

  private loadSeenState() {
    try {
      const raw = localStorage.getItem(this.seenStorageKey);
      if (!raw) {
        this.seenByVentaId = {};
        return;
      }

      const parsed = JSON.parse(raw);
      this.seenByVentaId = parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      this.seenByVentaId = {};
    }
  }

  private persistSeenState() {
    localStorage.setItem(this.seenStorageKey, JSON.stringify(this.seenByVentaId));
  }
}
