import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AdminMarketingPageRoutingModule } from './admin-marketing-routing.module';
import { AdminMarketingPage } from './admin-marketing.page';

@NgModule({
  imports: [CommonModule, IonicModule, AdminMarketingPageRoutingModule, AdminMarketingPage],
})
export class AdminMarketingPageModule {}
