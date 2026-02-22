import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    console.log('🛡️ AuthGuard - Verificando acceso a:', state.url);
    const token = this.auth.getToken();
    console.log('🛡️ AuthGuard - Token encontrado:', token ? 'SÍ' : 'NO');

    if (token) {
      console.log('✅ AuthGuard - Acceso permitido');
      return true;
    }

    console.log('❌ AuthGuard - Sin token, redirigiendo a login');
    this.router.navigate(['/login']);
    return false;
  }
}
