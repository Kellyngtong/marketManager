import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminMarketingPage } from './admin-marketing.page';

const routes: Routes = [
  {
    path: '',
    component: AdminMarketingPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminMarketingPageRoutingModule {}
