import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TrabajaPage } from './trabaja.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrabajaPage,
    RouterModule.forChild([{ path: '', component: TrabajaPage }]),
  ],
  declarations: [],
})
export class TrabajaPageModule {}
