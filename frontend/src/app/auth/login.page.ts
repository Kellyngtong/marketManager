import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email = '';
  password = '';

  constructor(private auth: AuthService, public router: Router, private toastCtrl: ToastController) {}

  async submit() {
    if (!this.email || !this.password) {
      const t = await this.toastCtrl.create({ message: 'Completa email y contraseña', duration: 2000, color: 'warning' });
      await t.present();
      return;
    }

    try {
      const res: any = await firstValueFrom(this.auth.login({ email: this.email, password: this.password }));
      if (res && res.accessToken) {
        this.router.navigateByUrl('/home', { replaceUrl: true });
      }
    } catch (err: any) {
      let msg = 'Login failed';
      if (err?.error?.message) msg = err.error.message;
      else if (err?.message) msg = err.message;
      else if (err?.status) msg = `Error ${err.status} ${err.statusText || ''}`;

      const t = await this.toastCtrl.create({ message: msg, duration: 3000, color: 'danger' });
      await t.present();
      console.error('Login error', err);
    }
  }
}
