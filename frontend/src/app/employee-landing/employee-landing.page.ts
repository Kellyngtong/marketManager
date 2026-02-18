import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-employee-landing',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './employee-landing.page.html',
  styleUrls: ['./employee-landing.page.scss'],
})
export class EmployeeLandingPage {
  constructor(private router: Router, private auth: AuthService) {}

  ionViewWillEnter() {
    const user = this.auth.currentUserValue;
    const rolId = user?.idrol ?? user?.rol?.idrol;
    const rolNombre = String(user?.rol?.nombre || user?.rol || '').toLowerCase();
    const isEmpleado = rolId === 3 || rolNombre.includes('empleado') || rolNombre.includes('staff');

    if (!isEmpleado) {
      this.router.navigateByUrl('/home', { replaceUrl: true });
    }
  }

  goToInventario() {
    this.router.navigateByUrl('/employers');
  }

  goToPedidos() {
    this.router.navigateByUrl('/adminPedidos');
  }

  goToMarketing() {
    this.router.navigateByUrl('/adminMarketing');
  }

  goToContable() {
    this.router.navigateByUrl('/contable');
  }
}
