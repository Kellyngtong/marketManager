import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { Subscription, firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CarritoService } from '../services/carrito.service';
import { PagosService } from '../services/pagos.service';

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
  isProcessing = false;
  private userSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private carritoService: CarritoService,
    private pagosService: PagosService,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController
  ) {
    this.checkoutForm = this.fb.group({
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
    });

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

  async irAPago() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isProcessing = true;
    const loading = await this.loadingCtrl.create({ message: 'Preparando pago...' });
    await loading.present();

    const formValue = this.checkoutForm.value;
    try {
      // Crear sesión de Stripe
      const response = await firstValueFrom(
        this.pagosService.crearSesionPago({
          direccion: formValue.direccion,
          telefono: formValue.telefono,
        })
      );

      // Guardar sessionId para verificación posterior
      localStorage.setItem('stripe_session_id', response.sessionId);

      await loading.dismiss();

      // Redirigir a Stripe Checkout
      await this.pagosService.redirigirAStripe(response.sessionId, response.publicKey);
    } catch (error) {
      await loading.dismiss();
      this.isProcessing = false;
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
