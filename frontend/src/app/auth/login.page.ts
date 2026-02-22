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
  // Tab control
  activeTab: 'login' | 'register' = 'login';

  // Login form
  email = '';
  password = '';

  // Register form
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerPasswordConfirm = '';

  loading = false;

  // Cuentas de prueba para desarrollo
  testAccounts: TestAccount[] = [
    {
      email: 'admin@test.com',
      password: 'admin123',
      name: 'Admin',
      role: 'Administrador',
    },
    {
      email: 'empleado@test.com',
      password: 'empleado123',
      name: 'Empleado',
      role: 'Staff',
    },
    {
      email: 'cliente@test.com',
      password: 'cli123',
      name: 'Cliente',
      role: 'Cliente estándar',
    },
    {
      email: 'premium@test.com',
      password: 'pre123',
      name: 'Premium',
      role: 'Cliente premium',
    },
  ];

  constructor(
    private auth: AuthService,
    public router: Router,
    private toastCtrl: ToastController,
  ) {}

  selectTestAccount(account: TestAccount) {
    this.email = account.email;
    this.password = account.password;
  }

  async submit() {
    if (!this.email || !this.password) {
      const t = await this.toastCtrl.create({
        message: 'Completa email y contraseña',
        duration: 2000,
        color: 'warning',
      });
      await t.present();
      return;
    }

    this.loading = true;
    try {
      const res: any = await firstValueFrom(
        this.auth.login({ email: this.email, password: this.password }),
      );
      if (res && res.accessToken) {
        const user = res?.usuario;
        const rolId = user?.idrol ?? user?.rol?.idrol;
        const rolNombre = String(
          user?.rol?.nombre || user?.rol || '',
        ).toLowerCase();
        const isAdmin = rolId === 4 || rolNombre.includes('admin');
        const isEmpleado =
          rolId === 3 ||
          rolNombre.includes('empleado') ||
          rolNombre.includes('staff');

        const targetRoute = isAdmin
          ? '/admin/dashboard'
          : isEmpleado
            ? '/empleado'
            : '/home';
        this.router.navigateByUrl(targetRoute, { replaceUrl: true });
      }
    } catch (err: any) {
      let msg = 'Login failed';
      if (err?.error?.message) msg = err.error.message;
      else if (err?.message) msg = err.message;
      else if (err?.status) msg = `Error ${err.status} ${err.statusText || ''}`;

      const t = await this.toastCtrl.create({
        message: msg,
        duration: 3000,
        color: 'danger',
      });
      await t.present();
      console.error('Login error', err);
    } finally {
      this.loading = false;
    }
  }

  async submitRegister() {
    if (!this.registerName || !this.registerEmail || !this.registerPassword) {
      const t = await this.toastCtrl.create({
        message: 'Completa todos los campos',
        duration: 2000,
        color: 'warning',
      });
      await t.present();
      return;
    }

    if (this.registerPassword !== this.registerPasswordConfirm) {
      const t = await this.toastCtrl.create({
        message: 'Las contraseñas no coinciden',
        duration: 2000,
        color: 'warning',
      });
      await t.present();
      return;
    }

    this.loading = true;
    try {
      const res: any = await firstValueFrom(
        this.auth.register({
          nombre: this.registerName,
          email: this.registerEmail,
          clave: this.registerPassword,
          idrol: 1, // Cliente por defecto
        }),
      );
      if (res) {
        const t = await this.toastCtrl.create({
          message: '¡Cuenta creada exitosamente! Inicia sesión',
          duration: 3000,
          color: 'success',
        });
        await t.present();

        // Cambiar a tab login y llenar campos
        this.activeTab = 'login';
        this.email = this.registerEmail;
        this.password = this.registerPassword;
        this.registerName = '';
        this.registerEmail = '';
        this.registerPassword = '';
        this.registerPasswordConfirm = '';
      }
    } catch (err: any) {
      let msg = 'Registration failed';
      if (err?.error?.message) msg = err.error.message;
      else if (err?.message) msg = err.message;
      else if (err?.status) msg = `Error ${err.status} ${err.statusText || ''}`;

      const t = await this.toastCtrl.create({
        message: msg,
        duration: 3000,
        color: 'danger',
      });
      await t.present();
      console.error('Register error', err);
    } finally {
      this.loading = false;
    }
  }
}
