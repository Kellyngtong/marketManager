import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { SupermercadosPage } from './supermercados.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SupermercadosPage,
    RouterModule.forChild([{ path: '', component: SupermercadosPage }]),
  ],
  declarations: [],
})
export class SupermercadosPageModule {}
