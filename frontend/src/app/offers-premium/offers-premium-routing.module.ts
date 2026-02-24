import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OffersPremiumPage } from './offers-premium.page';

const routes: Routes = [
  {
    path: '',
    component: OffersPremiumPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OffersPremiumPageRoutingModule {}
