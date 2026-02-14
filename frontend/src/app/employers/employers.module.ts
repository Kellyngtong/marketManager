import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { EmployersPageRoutingModule } from './employers-routing.module';
import { EmployersPage } from './employers.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmployersPageRoutingModule,
    EmployersPage,
  ],
})
export class EmployersPageModule {}
