import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { OrderDetailPage } from './order-detail.page';

@NgModule({
  declarations: [OrderDetailPage],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: OrderDetailPage,
      },
    ]),
  ],
})
export class OrderDetailPageModule {}
