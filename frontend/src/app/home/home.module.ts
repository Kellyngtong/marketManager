import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { ProductCardModule } from '../product-card/product-card.module';
import { HomePageRoutingModule } from './home-routing.module';
import { FilterBarComponent } from '../components/filter-bar/filter-bar.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    ProductCardModule,
    FilterBarComponent,
  ],
  declarations: [HomePage],
})
export class HomePageModule {}
