import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  nombre = '';
  email = '';
  password = '';
  telefono = '';
  direccion = '';
  avatarFile: File | null = null;
  previewUrl: string | null = null;

  constructor(private auth: AuthService, public router: Router, private toastCtrl: ToastController) {}

  async submit() {
    if (!this.nombre || !this.email || !this.password) {
      const t = await this.toastCtrl.create({ message: 'Completa todos los campos', duration: 2000, color: 'warning' });
      await t.present();
      return;
    }

    try {
      // If the user selected an avatar, upload it first and include its URL in the register payload
      let avatarUrl: string | undefined = undefined;
      if (this.avatarFile) {
        try {
          const up: any = await firstValueFrom(this.auth.uploadAvatar(this.avatarFile));
          if (up && up.imageUrl) avatarUrl = up.imageUrl;
        } catch (uploadErr: any) {
          console.error('Avatar upload error during register', uploadErr);
          // Show a helpful message but continue with registration without avatar
          const t = await this.toastCtrl.create({ message: `Error subiendo avatar: ${uploadErr?.error?.error || uploadErr?.error?.message || uploadErr?.message || 'unknown'}`, duration: 3000, color: 'warning' });
          await t.present();
        }
      }

      const payload: any = {
        nombre: this.nombre,
        email: this.email,
        password: this.password,
        telefono: this.telefono || undefined,
        direccion: this.direccion || undefined,
      };

      if (avatarUrl) payload.avatar = avatarUrl;

      await firstValueFrom(this.auth.register(payload));
      const t = await this.toastCtrl.create({ message: 'Registro correcto. Ya puedes iniciar sesión.', duration: 2000 });
      await t.present();
      this.router.navigateByUrl('/login');
    } catch (err: any) {
      // Prefer server JSON message, otherwise fallback to status/text
      let msg = 'Registro falló';
      if (err?.error?.message) msg = err.error.message;
      else if (err?.message) msg = err.message;
      else if (err?.status) msg = `Error ${err.status} ${err.statusText || ''}`;

      const t = await this.toastCtrl.create({ message: msg, duration: 3500, color: 'danger' });
      await t.present();
      console.error('Register error', err);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    // Validate file size and type before accepting
  const MAX = 30 * 1024 * 1024; // 30MB (must match backend limit)
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (file.size > MAX) {
      this.avatarFile = null;
      input.value = '';
      this.toastCtrl.create({ message: 'Imagen demasiado grande. Máx 5MB.', duration: 2500, color: 'warning' }).then(t => t.present());
      return;
    }
    if (!allowed.includes(file.type)) {
      this.avatarFile = null;
      input.value = '';
      this.toastCtrl.create({ message: 'Tipo de archivo no permitido. Usa PNG/JPG/WEBP/GIF.', duration: 2500, color: 'warning' }).then(t => t.present());
      return;
    }

    this.avatarFile = file;
    try {
      this.previewUrl = URL.createObjectURL(file);
    } catch (e) {
      this.previewUrl = null;
    }
  }
}
