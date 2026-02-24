import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { OffersPage } from './offers.page';
import { ProductCardModule } from '../product-card/product-card.module';
import { OffersPageRoutingModule } from './offers-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OffersPageRoutingModule,
    ProductCardModule,
  ],
  declarations: [OffersPage],
})
export class OffersPageModule {}