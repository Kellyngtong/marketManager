import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from './auth.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean> {
    const token = this.auth.getToken();
    const user = this.auth.currentUserValue;

    console.log('🛡️ RoleGuard - Verificando acceso a:', state.url);
    console.log('🛡️ RoleGuard - Usuario:', user?.nombre, 'Rol:', user?.idrol);

    if (!token || !user) {
      console.log('❌ RoleGuard - Sin token/usuario');
      this.router.navigate(['/login']);
      return false;
    }

    // Obtener roles requeridos de la ruta
    const requiredRoles = route.data['roles'] as number[];

    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('✅ RoleGuard - Acceso permitido (sin restricción de roles)');
      return true;
    }

    // Verificar si el usuario tiene uno de los roles requeridos
    const hasRole = requiredRoles.includes(user.idrol);

    if (hasRole) {
      console.log('✅ RoleGuard - Acceso permitido (rol autorizado)');
      return true;
    }

    console.log('❌ RoleGuard - Rol no autorizado');
    const toast = await this.toastCtrl.create({
      message: 'No tienes permisos para acceder a esta sección',
      duration: 3000,
      color: 'danger',
    });
    await toast.present();

    this.router.navigate(['/home']);
    return false;
  }
}
