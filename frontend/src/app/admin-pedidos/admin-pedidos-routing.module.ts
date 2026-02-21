import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPedidosPage } from './admin-pedidos.page';

const routes: Routes = [
  {
    path: '',
    component: AdminPedidosPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPedidosPageRoutingModule {}
