import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ConocenosPage } from './conocenos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConocenosPage,
    RouterModule.forChild([{ path: '', component: ConocenosPage }]),
  ],
  declarations: [],
})
export class ConocenosPageModule {}
