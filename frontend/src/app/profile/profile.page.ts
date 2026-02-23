import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { Subscription, firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ConfirmationModalComponent } from '../admin/confirmation-modal/confirmation-modal.component';

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
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private router: Router,
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
        this.profileForm.patchValue(
          {
            nombre: user.nombre || user.username || '',
            email: user.email || '',
            telefono: user.telefono || '',
            direccion: user.direccion || '',
            rol: user.rol?.nombre || 'Cliente',
          },
          { emitEvent: false },
        );
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

    const { nombre, email, telefono, direccion } =
      this.profileForm.getRawValue();
    try {
      await firstValueFrom(
        this.auth.updateProfile({ nombre, email, telefono, direccion }),
      );
      const t = await this.toastCtrl.create({
        message: 'Perfil actualizado',
        duration: 2000,
        color: 'success',
      });
      await t.present();
    } catch (error: any) {
      const message =
        error?.error?.message ||
        error?.error?.error ||
        error?.message ||
        'No se pudo actualizar el perfil';
      const t = await this.toastCtrl.create({
        message,
        duration: 3000,
        color: 'danger',
      });
      await t.present();
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  async confirmLogout() {
    const modal = await this.modalCtrl.create({
      component: ConfirmationModalComponent,
      cssClass: 'confirmation-modal',
      componentProps: {
        title: 'Cerrar sesión',
        message: '¿Estás seguro de que quieres cerrar sesión?',
        isDangerous: true,
        cancelText: 'Cancelar',
        confirmText: 'Cerrar sesión',
      },
    });

    await modal.present();
    const result = await modal.onDidDismiss();
    if (result.data?.confirmed === true) {
      this.logout();
    }
  }

  isPremiumUser(): boolean {
    const current = this.user;
    const topLevelRol = current?.idrol;
    const nestedRol = current?.rol?.idrol;
    const rolNombre = String(current?.rol?.nombre || current?.rol || '').toLowerCase();

    return topLevelRol === 2 || nestedRol === 2 || rolNombre.includes('premium');
  }

  goToPremiumCheckout() {
    this.router.navigate(['/checkout'], { queryParams: { mode: 'premium' } });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }
}
