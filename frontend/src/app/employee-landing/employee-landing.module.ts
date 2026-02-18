import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { EmployeeLandingPageRoutingModule } from './employee-landing-routing.module';
import { EmployeeLandingPage } from './employee-landing.page';

@NgModule({
  imports: [CommonModule, IonicModule, EmployeeLandingPageRoutingModule, EmployeeLandingPage],
})
export class EmployeeLandingPageModule {}
