import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Subscription, firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnDestroy {
  profileForm: FormGroup;
  userSub?: Subscription;
  user: any = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      direccion: [''],
      rol: [{ value: '', disabled: true }],
    });

    this.userSub = this.auth.user$.subscribe((user) => {
      this.user = user;
      if (user) {
        this.profileForm.patchValue({
          nombre: user.nombre || user.username || '',
          email: user.email || '',
          telefono: user.telefono || '',
          direccion: user.direccion || '',
          rol: user.rol?.nombre || 'Cliente',
        }, { emitEvent: false });
      }
    });
  }

  ionViewWillEnter() {
    this.auth.getProfile().subscribe({ error: () => {} });
  }

  async saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const { nombre, email, telefono, direccion } = this.profileForm.getRawValue();
    try {
      await firstValueFrom(this.auth.updateProfile({ nombre, email, telefono, direccion }));
      const t = await this.toastCtrl.create({ message: 'Perfil actualizado', duration: 2000, color: 'success' });
      await t.present();
    } catch (error: any) {
      const message =
        error?.error?.message ||
        error?.error?.error ||
        error?.message ||
        'No se pudo actualizar el perfil';
      const t = await this.toastCtrl.create({ message, duration: 3000, color: 'danger' });
      await t.present();
    }
  }

  async changePassword() {
    const alert = await this.alertCtrl.create({
      header: 'Cambiar contraseña',
      message: 'Esta función estará disponible en el Sprint 2.',
      buttons: ['Entendido'],
    });
    await alert.present();
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/welcome', { replaceUrl: true });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }
}
