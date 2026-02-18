import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ContablePageRoutingModule } from './contable-routing.module';
import { ContablePage } from './contable.page';

@NgModule({
  imports: [CommonModule, IonicModule, ContablePageRoutingModule, ContablePage],
})
export class ContablePageModule {}
