import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContablePage } from './contable.page';

const routes: Routes = [
  {
    path: '',
    component: ContablePage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContablePageRoutingModule {}
