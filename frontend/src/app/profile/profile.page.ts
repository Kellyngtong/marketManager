import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, ModalController } from '@ionic/angular';
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
  @ViewChild('avatarInput') avatarInput?: ElementRef<HTMLInputElement>;

  profileForm: FormGroup;
  userSub?: Subscription;
  user: any = null;
  isUploadingAvatar = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private router: Router,
    private modalCtrl: ModalController,
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

  triggerAvatarPicker() {
    this.avatarInput?.nativeElement?.click();
  }

  async onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const MAX = 2 * 1024 * 1024;
    if (file.size > MAX) {
      const warn = await this.toastCtrl.create({
        message: 'La imagen es demasiado grande (máximo 2MB).',
        duration: 3000,
        color: 'warning',
      });
      await warn.present();
      input.value = '';
      return;
    }

    this.isUploadingAvatar = true;
    try {
      let avatarUrl: string | null = null;

      try {
        const uploadRes: any = await firstValueFrom(
          this.auth.uploadAvatar(file),
        );
        avatarUrl = uploadRes?.imageUrl || uploadRes?.url || null;
      } catch (uploadError: any) {
        avatarUrl = await this.fileToDataUrl(file);
      }

      if (!avatarUrl) {
        throw new Error('No se pudo subir la foto');
      }

      try {
        await firstValueFrom(
          this.auth.updateProfile({ avatar: avatarUrl }),
        );
      } catch (profileError) {
        this.auth.updateLocalUser({ avatar: avatarUrl });
      }

      const toast = await this.toastCtrl.create({
        message: 'Foto de perfil actualizada',
        duration: 2000,
        color: 'success',
      });
      await toast.present();
    } catch (error: any) {
      console.error('Error updating avatar', error);
      const msg =
        error?.error?.message ||
        error?.message ||
        'No se pudo actualizar la foto de perfil';
      const toast = await this.toastCtrl.create({
        message: msg,
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.isUploadingAvatar = false;
      input.value = '';
    }
  }

  onAvatarImageError() {
    this.auth.updateLocalUser({ avatar: null });
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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

  
  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }
}
