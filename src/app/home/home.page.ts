import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder } from "@angular/forms";
import { Capacitor, Plugins} from "@capacitor/core";
import { LocationService } from '../location.service';
const { Geolocation, Toast} = Plugins;

import { DbService } from './../services/db.service';
import { ToastController } from '@ionic/angular';
import { Router } from "@angular/router";
import { FromEventTarget } from 'rxjs/internal/observable/fromEvent';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  mainForm: FormGroup;
  Data: any[] = [{id:1, lat:"111", lng:"-111"}];

  lat: any;
  lng: any;
  watchId: any;
  constructor(public ngZone: NgZone, 
    private locationService: LocationService,
    private db: DbService,
    public formBuilder: FormBuilder,
    private toast: ToastController,
    private router: Router) {
    this.lat = 38.897957;
    this.lng = -77.036560;
  }




  ngOnInit(){
    this.db.dbState().subscribe(
      async (res)=>{
        if(res){
          this.db.fetchPlaces().subscribe(async item => {
            this.Data = item;
            let toast = await this.toast.create({
              message:'db loaded',
              duration: 2500
            });
            toast.present();
          })
        }else{
          let toast = await this.toast.create({
            message:'Res is empty',
            duration: 2500
          });
          toast.present();
        }
      }
    );
    this.mainForm = this.formBuilder.group({
      lat:[''],
      lng:['']
    });
  }

  storeData(){
    this.db.dbState().subscribe(async res=>{
      let toast = await this.toast.create({
        message:`DB state: ${res}`,
        duration: 2500
      });
      toast.present();
      if(res){}else{
        this.db.init().then(res=>{


        }).catch(async error=>{
          let toast = await this.toast.create({
            message:`error: ${error}`,
            duration: 2500
          });
          toast.present();
        })
      }
    });
    this.db.addPlace(
      this.mainForm.value.lat,
      this.mainForm.value.lng
    )
    .then((res)=>{
      this.mainForm.reset();
      
    }).catch(async error => {
      let toast = await this.toast.create({
        message: `error: ${error}`,
        duration: 2500
      });
      toast.present();
    });
  }

  deletePlace(id){
    this.db.deletePlace(id).then(async(res)=>{
      let toast = await this.toast.create({
        message:'Place deleted',
        duration: 2500
      });
      toast.present();
    })
  }





  
  async getMyLocation() {
    const hasPermission = await this.locationService.checkGPSPermission();
    if (hasPermission) {
      if (Capacitor.isNative) {
        const canUseGPS = await this.locationService.askToTurnOnGPS();
        this.postGPSPermission(canUseGPS);
      }
      else { this.postGPSPermission(true); }
    }
    else {
      const permission = await this.locationService.requestGPSPermission();
      if (permission === 'CAN_REQUEST' || permission === 'GOT_PERMISSION') {
        if (Capacitor.isNative) {
          const canUseGPS = await this.locationService.askToTurnOnGPS();
          this.postGPSPermission(canUseGPS);
        }
        else { this.postGPSPermission(true); }
      }
      else {
        await Toast.show({
          text: 'User denied location permission'
        })
      }
    }
  }

  async postGPSPermission(canUseGPS: boolean) {
    if (canUseGPS) { this.watchPosition(); }
    else {
      await Toast.show({
        text: 'Please turn on GPS to get location'
      })
    }
  }

  async watchPosition() {
    try {
      this.watchId = Geolocation.watchPosition({}, (position, err) => {
        this.ngZone.run(() => {
          if (err) { console.log('err', err); return; }
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude
          this.clearWatch();
        })
      })
    }
    catch (err) { console.log('err', err) }
  }

  clearWatch() {
    if (this.watchId != null) {
      Geolocation.clearWatch({ id: this.watchId });
    }
  }
}
