import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { VentasService, VentaResumen } from '../services/ventas.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: false,
})
export class HistorialPage {
  historial: VentaResumen[] = [];
  isLoading = false;

  constructor(
    private ventasService: VentasService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ionViewWillEnter() {
    console.log('📄 HistorialPage.ionViewWillEnter() - Cargando historial...');
    this.loadHistorial();
  }

  async loadHistorial(event?: any) {
    if (!event) {
      this.isLoading = true;
    }
    try {
      console.log('⏳ loadHistorial() - Iniciando carga del historial...');
      const res = await firstValueFrom(this.ventasService.getHistorial());
      console.log('✅ loadHistorial() - Datos recibidos:', res);
      this.historial = res?.historial || [];
    } catch (error) {
      console.error('❌ loadHistorial() - Error:', error);
      await this.presentError(error);
    } finally {
      this.isLoading = false;
      event?.target?.complete();
    }
  }

  verDetalle(venta: VentaResumen) {
    this.router.navigate(['/order', venta.idventa]);
  }

  trackByVenta(_: number, venta: VentaResumen) {
    return venta.idventa;
  }

  async presentError(error: any) {
    const message =
      error?.error?.message ||
      error?.error?.error ||
      error?.message ||
      'No se pudo cargar la información';
    const t = await this.toastCtrl.create({ message, duration: 2500, color: 'danger' });
    await t.present();
  }
}
