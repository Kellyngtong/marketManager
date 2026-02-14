import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { PaymentSuccessPage } from './payment-success.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PaymentSuccessPage,
    RouterModule.forChild([
      {
        path: '',
        component: PaymentSuccessPage,
      },
    ]),
  ],
})
export class PaymentSuccessPageModule {}
