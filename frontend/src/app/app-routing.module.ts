import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LandingPage } from './landing/landing.page';
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/role.guard';

const routes: Routes = [
  {
    path: '',
    component: LandingPage,
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: 'cliente-premium',
    canActivate: [RoleGuard],
    data: { roles: [2] }, // Solo Premium (rol 2)
    loadChildren: () =>
      import('./cliente-premium/cliente-premium.module').then(
        (m) => m.ClientePremiumPageModule,
      ),
  },
  {
    path: 'ofertas',
    loadChildren: () =>
      import('./offers/offers.module').then((m) => m.OffersPageModule),
  },
  {
    path: 'ofertas-premium',
    canActivate: [RoleGuard],
    data: { roles: [2] }, // Solo Premium (rol 2)
    loadChildren: () =>
      import('./offers-premium/offers-premium.module').then(
        (m) => m.OffersPremiumPageModule,
      ),
  },
  {
    path: 'product/:id',
    loadChildren: () =>
      import('./product-detail/product-detail.module').then(
        (m) => m.ProductDetailPageModule,
      ),
  },
  {
    path: 'order/:id',
    loadChildren: () =>
      import('./order-detail/order-detail.module').then(
        (m) => m.OrderDetailPageModule,
      ),
  },
  {
    path: 'cart',
    loadChildren: () =>
      import('./cart/cart.module').then((m) => m.CartPageModule),
  },
  {
    path: 'checkout',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./checkout/checkout.module').then((m) => m.CheckoutPageModule),
  },
  {
    path: 'payment-success',
    loadChildren: () =>
      import('./payment-success/payment-success.module').then(
        (m) => m.PaymentSuccessPageModule,
      ),
  },
  {
    path: 'payment-cancel',
    loadChildren: () =>
      import('./payment-cancel/payment-cancel.module').then(
        (m) => m.PaymentCancelPageModule,
      ),
  },
  {
    path: 'historial',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./historial/historial.module').then((m) => m.HistorialPageModule),
  },
  {
    path: 'empleado',
    canActivate: [RoleGuard],
    data: { roles: [3] }, // Solo Empleado (rol 3)
    loadChildren: () =>
      import('./employee-landing/employee-landing.module').then(
        (m) => m.EmployeeLandingPageModule,
      ),
  },
  {
    path: 'employers',
    canActivate: [RoleGuard],
    data: { roles: [3] }, // Solo Empleado (rol 3)
    loadChildren: () =>
      import('./employers/employers.module').then((m) => m.EmployersPageModule),
  },
  {
    path: 'adminPedidos',
    canActivate: [RoleGuard],
    data: { roles: [3, 4] }, // Empleado y Admin
    loadChildren: () =>
      import('./admin-pedidos/admin-pedidos.module').then(
        (m) => m.AdminPedidosPageModule,
      ),
  },
  {
    path: 'admin-pedidos',
    canActivate: [RoleGuard],
    data: { roles: [3, 4] }, // Empleado y Admin
    loadChildren: () =>
      import('./admin-pedidos/admin-pedidos.module').then(
        (m) => m.AdminPedidosPageModule,
      ),
  },
  {
    path: 'adminMarketing',
    canActivate: [RoleGuard],
    data: { roles: [3, 4] }, // Empleado y Admin
    loadChildren: () =>
      import('./admin-marketing/admin-marketing.module').then(
        (m) => m.AdminMarketingPageModule,
      ),
  },
  {
    path: 'admin-marketing',
    canActivate: [RoleGuard],
    data: { roles: [3, 4] }, // Empleado y Admin
    loadChildren: () =>
      import('./admin-marketing/admin-marketing.module').then(
        (m) => m.AdminMarketingPageModule,
      ),
  },
  {
    path: 'contable',
    canActivate: [RoleGuard],
    data: { roles: [3, 4] }, // Empleado y Admin
    loadChildren: () =>
      import('./contable/contable.module').then((m) => m.ContablePageModule),
  },
  {
    path: 'admin',
    canActivate: [RoleGuard],
    data: { roles: [4] }, // Solo Admin (rol 4)
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminPageModule),
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./profile/profile.module').then((m) => m.ProfilePageModule),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./auth/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./auth/register.module').then((m) => m.RegisterPageModule),
  },
  {
    path: 'conocenos',
    loadChildren: () => import('./conocenos/conocenos.module').then( m => m.ConocenosPageModule)
  },
  {
    path: 'supermercados',
    loadChildren: () => import('./supermercados/supermercados.module').then(m => m.SupermercadosPageModule)
  },
  {
    path: 'trabaja',
    loadChildren: () => import('./trabaja/trabaja.module').then(m => m.TrabajaPageModule)
  },
  {
    path: 'atencion',
    loadChildren: () => import('./atencion/atencion.module').then(m => m.AtencionPageModule)
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
