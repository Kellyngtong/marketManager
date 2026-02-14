import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

interface TestAccount {
  email: string;
  password: string;
  name: string;
  role: string;
}

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

  // Cuentas de prueba para desarrollo
  testAccounts: TestAccount[] = [
    {
      email: 'admin@test.com',
      password: 'admin123',
      name: '👨‍💼 Admin',
      role: 'Administrador',
    },
    {
      email: 'empleado@test.com',
      password: 'emp123',
      name: '👨‍💻 Empleado',
      role: 'Staff',
    },
    {
      email: 'cliente@test.com',
      password: 'cli123',
      name: '🛒 Cliente',
      role: 'Cliente estándar',
    },
    {
      email: 'premium@test.com',
      password: 'pre123',
      name: '⭐ Premium',
      role: 'Cliente premium',
    },
  ];

  constructor(private auth: AuthService, public router: Router, private toastCtrl: ToastController) {}

  selectTestAccount(account: TestAccount) {
    this.email = account.email;
    this.password = account.password;
  }

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

