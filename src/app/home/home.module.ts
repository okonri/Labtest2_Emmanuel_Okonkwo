import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    IonicModule,
    HomePageRoutingModule,
    AgmCoreModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}

//https://enappd.com/blog/ionic-5-complete-guide-on-geolocation/141/
