import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { EmployersPageRoutingModule } from './employers-routing.module';
import { EmployersPage } from './employers.page';

@NgModule({
  imports: [CommonModule, IonicModule, EmployersPageRoutingModule, EmployersPage],
})
export class EmployersPageModule {}
