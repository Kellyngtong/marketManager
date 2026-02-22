import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { OffersPremiumPage } from './offers-premium.page';
import { ProductCardModule } from '../product-card/product-card.module';
import { OffersPremiumPageRoutingModule } from './offers-premium-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OffersPremiumPageRoutingModule,
    ProductCardModule,
  ],
  declarations: [OffersPremiumPage],
})
export class OffersPremiumPageModule {}
