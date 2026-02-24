import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClientePremiumPage } from './cliente-premium.page';

const routes: Routes = [
  {
    path: '',
    component: ClientePremiumPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientePremiumPageRoutingModule {}
