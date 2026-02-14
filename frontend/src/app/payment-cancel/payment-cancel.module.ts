import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { PaymentCancelPage } from './payment-cancel.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PaymentCancelPage,
    RouterModule.forChild([
      {
        path: '',
        component: PaymentCancelPage,
      },
    ]),
  ],
})
export class PaymentCancelPageModule {}
