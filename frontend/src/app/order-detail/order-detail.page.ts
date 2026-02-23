import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { VentasService } from '../services/ventas.service';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

interface OrderItem {
  id?: number;
  idarticulo?: number;
  name?: string;
  nombre?: string;
  quantity?: number;
  cantidad?: number;
  price?: number;
  precio?: number;
  discount?: number;
  descuento?: number;
  image?: string;
  imagen?: string;
  articulo?: {
    nombre?: string;
    imagen?: string;
  };
}

interface TimelineStep {
  status: string;
  date: string;
  completed: boolean;
}

interface Order {
  id?: number;
  idventa?: number;
  orderNumber?: string;
  numero?: string;
  date?: string;
  fecha?: string;
  status?: string;
  estado?: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod?: string;
  metodo_pago?: string;
  items?: OrderItem[];
  subtotal?: number;
  shipping?: number;
  tax?: number;
  impuesto?: number;
  total?: number;
  timeline?: TimelineStep[];
  direccion_envio?: string;
}

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.page.html',
  styleUrls: ['./order-detail.page.scss'],
  standalone: false,
})
export class OrderDetailPage implements OnInit {
  order: Order | null = null;
  loading = true;
  error: string | null = null;
  isUserView = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private ventasService: VentasService,
    private toastCtrl: ToastController,
  ) {}

  ngOnInit() {
    this.loadOrder();
  }

  async loadOrder() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('🔍 Order ID from route:', id);
    if (!id) {
      this.error = 'ID de pedido inválido';
      this.loading = false;
      return;
    }

    try {
      // Primero intentar cargar desde ventas (usuario autenticado)
      const ventaId = parseInt(id, 10);
      const detalleRes = await firstValueFrom(
        this.ventasService.getDetalleVenta(ventaId),
      );
      const venta = detalleRes?.venta;

      if (venta) {
        this.isUserView = true;
        this.order = this.transformVentaToOrder(venta);
        console.log('✅ Order data loaded (user view):', this.order);
        this.loading = false;
        return;
      }
    } catch (err) {
      console.log('⚠️ No se encontró en ventas, intentando con admin...');
    }

    // Si falla, intentar con admin
    try {
      const adminData = await firstValueFrom(
        this.adminService.getOrderDetails(parseInt(id, 10)),
      );
      console.log('✅ Order data loaded (admin view):', adminData);
      this.order = adminData;
      this.isUserView = false;
      this.loading = false;
    } catch (err) {
      console.error('❌ Error loading order:', err);
      this.error = 'No se pudo cargar el pedido';
      this.loading = false;
    }
  }

  transformVentaToOrder(venta: any): Order {
    const subtotal = venta.total - venta.impuesto;
    return {
      idventa: venta.idventa,
      numero: venta.numero,
      orderNumber: venta.numero,
      fecha: venta.fecha,
      date: venta.fecha,
      estado: venta.estado,
      status: venta.estado,
      metodo_pago: venta.metodo_pago,
      paymentMethod: venta.metodo_pago,
      items: venta.items || [],
      impuesto: venta.impuesto || 0,
      tax: venta.impuesto || 0,
      total: venta.total || 0,
      subtotal: subtotal || 0,
      shipping: 0, // Usuario no tiene información de envío
      direccion_envio: venta.direccion_envio,
      timeline: this.buildTimeline(venta.estado),
    };
  }

  buildTimeline(status: string): TimelineStep[] {
    const normalized = String(status || '')
      .trim()
      .toUpperCase();

    const isPending = normalized === 'PENDIENTE';
    const isShipped = normalized === 'ENVIADA' || normalized === 'ENVIADO';
    const isClosed = normalized === 'CERRADA' || normalized === 'CERRADO';

    const steps: TimelineStep[] = [
      { status: 'Pedido Confirmado', date: '', completed: true },
      {
        status: 'Procesando',
        date: '',
        completed: isPending || isShipped || isClosed,
      },
      {
        status: 'Enviado',
        date: '',
        completed: isShipped || isClosed,
      },
      { status: 'Pedido entregado', date: '', completed: isClosed },
    ];
    return steps;
  }

  getStatusConfig(status: string) {
    const configs: any = {
      nuevo: {
        label: 'Nuevo',
        color: 'warning',
        icon: 'sparkles',
      },
      pendiente: {
        label: 'Pendiente',
        color: 'warning',
        icon: 'time',
      },
      enviada: {
        label: 'Enviada',
        color: 'primary',
        icon: 'send',
      },
      cerrada: {
        label: 'Cerrada',
        color: 'success',
        icon: 'checkmark-done',
      },
      completada: {
        label: 'Completada',
        color: 'success',
        icon: 'checkmark-circle',
      },
      delivered: {
        label: 'Entregado',
        color: 'success',
        icon: 'checkmark-circle',
      },
      procesando: {
        label: 'Procesando',
        color: 'info',
        icon: 'cube',
      },
      enviado: {
        label: 'Enviado',
        color: 'info',
        icon: 'plane',
      },
      cancelled: {
        label: 'Cancelado',
        color: 'danger',
        icon: 'close-circle',
      },
      pending: {
        label: 'Pendiente',
        color: 'warning',
        icon: 'time',
      },
    };

    const statusLower = status?.toLowerCase() || 'pending';
    return configs[statusLower] || configs.pending;
  }

  getItemPrice(item: OrderItem): number {
    const price = item.price || item.precio || 0;
    const discount = item.discount || item.descuento || 0;
    return discount ? price * (1 - discount / 100) : price;
  }

  getItemTotal(item: OrderItem): number {
    const quantity = item.quantity || item.cantidad || 1;
    return this.getItemPrice(item) * quantity;
  }

  goBack() {
    if (this.isUserView) {
      this.router.navigate(['/historial']);
    } else {
      this.router.navigate(['/admin']);
    }
  }

  async copyOrderNumber() {
    const orderNumber = this.order?.orderNumber || this.order?.numero;
    if (orderNumber) {
      await navigator.clipboard.writeText(orderNumber);
      const toast = await this.toastCtrl.create({
        message: 'Número de pedido copiado',
        duration: 2000,
        position: 'bottom',
      });
      toast.present();
    }
  }
}
