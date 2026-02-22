import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

import { AdminPageRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { EditUserModalComponent } from './edit-user-modal/edit-user-modal.component';
import { EditProductModalComponent } from './edit-product-modal/edit-product-modal.component';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    EditUserModalComponent,
    EditProductModalComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    AdminPageRoutingModule,
    ReactiveFormsModule,
    ConfirmationModalComponent,
  ],
})
export class AdminPageModule {}
