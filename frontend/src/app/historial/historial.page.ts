import { Component } from '@angular/core';
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
  selectedVenta: VentaResumen | null = null;
  detailOpen = false;
  isLoading = false;

  constructor(
    private ventasService: VentasService,
    private toastCtrl: ToastController
  ) {}

  ionViewWillEnter() {
    this.loadHistorial();
  }

  async loadHistorial(event?: any) {
    if (!event) {
      this.isLoading = true;
    }
    try {
      const res = await firstValueFrom(this.ventasService.getHistorial());
      this.historial = res?.historial || [];
    } catch (error) {
      await this.presentError(error);
    } finally {
      this.isLoading = false;
      event?.target?.complete();
    }
  }

  async verDetalle(venta: VentaResumen) {
    try {
      const res = await firstValueFrom(this.ventasService.getDetalleVenta(venta.idventa));
      this.selectedVenta = res?.venta || venta;
      this.detailOpen = true;
    } catch (error) {
      await this.presentError(error);
    }
  }

  closeDetalle() {
    this.detailOpen = false;
    this.selectedVenta = null;
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
