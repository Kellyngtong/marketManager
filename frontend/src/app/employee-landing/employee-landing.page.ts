import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ConfirmationModalComponent } from '../admin/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-employee-landing',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './employee-landing.page.html',
  styleUrls: ['./employee-landing.page.scss'],
})
export class EmployeeLandingPage {
  constructor(
    private router: Router,
    private auth: AuthService,
    private modalCtrl: ModalController,
  ) {}

  ionViewWillEnter() {
    const user = this.auth.currentUserValue;
    const rolId = user?.idrol ?? user?.rol?.idrol;
    const rolNombre = String(user?.rol?.nombre || user?.rol || '').toLowerCase();
    const isEmpleado = rolId === 3 || rolNombre.includes('empleado') || rolNombre.includes('staff');

    if (!isEmpleado) {
      this.router.navigateByUrl('/home', { replaceUrl: true });
    }
  }

  goToPedidos() {
    this.router.navigateByUrl('/admin-pedidos');
  }

  goToMarketing() {
    this.router.navigateByUrl('/admin-marketing');
  }

  goToContable() {
    this.router.navigateByUrl('/contable');
  }

  goToInventario() {
    this.router.navigateByUrl('/employers');
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
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
