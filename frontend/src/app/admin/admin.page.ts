import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class AdminPage {
  private readonly API_HOST = `${window.location.protocol}//${window.location.hostname}:4800`;

  isLoading = false;
  users: any[] = [];

  constructor(
    private authService: AuthService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ionViewWillEnter() {
    const current = this.authService.currentUserValue;
    if (!current || current.idrol !== 4) {
      this.router.navigateByUrl('/home', { replaceUrl: true });
      return;
    }

    this.loadUsers();
  }

  async loadUsers() {
    this.isLoading = true;
    try {
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(`${this.API_HOST}/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message || 'No se pudo obtener usuarios');
      }

      const data = await response.json();
      this.users = data?.usuarios || [];
    } catch (error: any) {
      this.users = [];
      const toast = await this.toastCtrl.create({
        message: error?.message || 'No se pudo cargar la lista de usuarios',
        duration: 2500,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  getRoleName(user: any) {
    return user?.rol?.nombre || user?.rol || 'Sin rol';
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
