import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AdminPedidosPageRoutingModule } from './admin-pedidos-routing.module';
import { AdminPedidosPage } from './admin-pedidos.page';

@NgModule({
  imports: [CommonModule, IonicModule, AdminPedidosPageRoutingModule, AdminPedidosPage],
})
export class AdminPedidosPageModule {}
