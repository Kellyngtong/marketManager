import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { ToastController } from '@ionic/angular';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  image: string;
}

interface TimelineStep {
  status: string;
  date: string;
  completed: boolean;
}

interface Order {
  id: number;
  orderNumber: string;
  date: string;
  status: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  timeline: TimelineStep[];
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private toastCtrl: ToastController,
  ) {}

  ngOnInit() {
    this.loadOrder();
  }

  loadOrder() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('🔍 Order ID from route:', id);
    if (!id) {
      this.error = 'ID de pedido inválido';
      this.loading = false;
      return;
    }

    console.log('📦 Calling getOrderDetails with ID:', id);
    this.adminService.getOrderDetails(parseInt(id, 10)).subscribe({
      next: (data) => {
        console.log('✅ Order data loaded:', data);
        this.order = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error loading order:', err);
        this.error = 'No se pudo cargar el pedido';
        this.loading = false;
      },
    });
  }

  getStatusConfig(status: string) {
    const configs: any = {
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
      pending: {
        label: 'Pendiente',
        color: 'warning',
        icon: 'time',
      },
      cancelled: {
        label: 'Cancelado',
        color: 'danger',
        icon: 'close-circle',
      },
    };

    const statusLower = status?.toLowerCase() || 'pending';
    return configs[statusLower] || configs.pending;
  }

  getItemPrice(item: OrderItem): number {
    return item.discount ? item.price * (1 - item.discount / 100) : item.price;
  }

  getItemTotal(item: OrderItem): number {
    return this.getItemPrice(item) * item.quantity;
  }

  goBack() {
    this.router.navigate(['/admin']);
  }

  async copyOrderNumber() {
    if (this.order?.orderNumber) {
      await navigator.clipboard.writeText(this.order.orderNumber);
      const toast = await this.toastCtrl.create({
        message: 'Número de pedido copiado',
        duration: 2000,
        position: 'bottom',
      });
      toast.present();
    }
  }
}
