import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ClientePremiumPage } from './cliente-premium.page';
import { ProductCardModule } from '../product-card/product-card.module';
import { ClientePremiumPageRoutingModule } from './cliente-premium-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientePremiumPageRoutingModule,
    ProductCardModule,
  ],
  declarations: [ClientePremiumPage],
})
export class ClientePremiumPageModule {}
