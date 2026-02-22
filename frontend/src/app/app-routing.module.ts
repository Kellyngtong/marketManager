import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LandingPage } from './landing/landing.page';

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
    path: 'product/:id',
    loadChildren: () =>
      import('./product-detail/product-detail.module').then(
        (m) => m.ProductDetailPageModule,
      ),
  },
  {
    path: 'cart',
    loadChildren: () =>
      import('./cart/cart.module').then((m) => m.CartPageModule),
  },
  {
    path: 'checkout',
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
    loadChildren: () =>
      import('./historial/historial.module').then((m) => m.HistorialPageModule),
  },
  {
    path: 'employers',
    loadChildren: () =>
      import('./employers/employers.module').then((m) => m.EmployersPageModule),
  },
  {
    path: 'empleado',
    loadChildren: () =>
      import('./employee-landing/employee-landing.module').then((m) => m.EmployeeLandingPageModule),
  },
  {
    path: 'adminPedidos',
    loadChildren: () =>
      import('./admin-pedidos/admin-pedidos.module').then((m) => m.AdminPedidosPageModule),
  },
  {
    path: 'adminMarketing',
    loadChildren: () =>
      import('./admin-marketing/admin-marketing.module').then((m) => m.AdminMarketingPageModule),
  },
  {
    path: 'contable',
    loadChildren: () =>
      import('./contable/contable.module').then((m) => m.ContablePageModule),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminPageModule),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./profile/profile.module').then((m) => m.ProfilePageModule),
  },
  {
    path: 'welcome',
    loadChildren: () =>
      import('./auth/welcome.module').then((m) => m.WelcomePageModule),
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
