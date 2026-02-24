import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeLandingPage } from './employee-landing.page';

const routes: Routes = [
  {
    path: '',
    component: EmployeeLandingPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeeLandingPageRoutingModule {}
