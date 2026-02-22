import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AtencionPage } from './atencion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AtencionPage,
    RouterModule.forChild([{ path: '', component: AtencionPage }]),
  ],
  declarations: [],
})
export class AtencionPageModule {}
