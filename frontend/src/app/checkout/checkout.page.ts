import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { Subscription, firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CarritoService } from '../services/carrito.service';
import { VentasService } from '../services/ventas.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: false,
})
export class CheckoutPage implements OnDestroy {
  checkoutForm: FormGroup;
  cartItems$ = this.carritoService.cartItems$;
  totals$ = this.carritoService.cartTotals$;
  private userSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private carritoService: CarritoService,
    private ventasService: VentasService,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController
  ) {
    this.checkoutForm = this.fb.group({
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      metodoPago: ['tarjeta', Validators.required],
      numeroTarjeta: [''],
    });

    this.checkoutForm.get('metodoPago')?.valueChanges.subscribe((metodo) => {
      const cardCtrl = this.checkoutForm.get('numeroTarjeta');
      if (!cardCtrl) return;

      if (metodo === 'tarjeta') {
        cardCtrl.setValidators([Validators.required, Validators.pattern(/^[0-9\s]{12,19}$/)]);
      } else {
        cardCtrl.clearValidators();
        cardCtrl.setValue('', { emitEvent: false });
      }
      cardCtrl.updateValueAndValidity({ emitEvent: false });
    });
    this.checkoutForm.get('metodoPago')?.updateValueAndValidity({ emitEvent: true });

    this.userSub = this.auth.user$.subscribe((user) => {
      if (user) {
        this.checkoutForm.patchValue({
          direccion: user.direccion || '',
          telefono: user.telefono || '',
        }, { emitEvent: false });
      }
    });
  }

  ionViewWillEnter() {
    this.carritoService.refreshCart().subscribe({ error: (err) => this.presentError(err) });
  }

  async completarCompra() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Procesando compra...' });
    await loading.present();

    const formValue = this.checkoutForm.value;
    try {
      await firstValueFrom(
        this.ventasService.checkout({
          metodoPago: formValue.metodoPago,
          numeroTarjeta: formValue.metodoPago === 'tarjeta' ? formValue.numeroTarjeta : null,
          datosEnvio: {
            direccion: formValue.direccion,
            telefono: formValue.telefono,
          },
        })
      );

      await loading.dismiss();
      await firstValueFrom(this.carritoService.refreshCart());
      const t = await this.toastCtrl.create({ message: 'Su compra ha sido realizada', duration: 2200, color: 'success' });
      await t.present();
      this.navCtrl.navigateRoot('/historial');
    } catch (error) {
      await loading.dismiss();
      await this.presentError(error);
    }
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  private async presentError(error: any) {
    const message =
      error?.error?.message ||
      error?.error?.error ||
      error?.message ||
      'No se pudo completar la operación';
    const t = await this.toastCtrl.create({ message, duration: 3000, color: 'danger' });
    await t.present();
  }
}
