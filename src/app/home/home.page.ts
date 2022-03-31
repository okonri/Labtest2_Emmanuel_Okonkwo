import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder } from "@angular/forms";
import { DbService } from './../services/db.service';
import { ToastController } from '@ionic/angular';
import { Router } from "@angular/router";
import { FromEventTarget } from 'rxjs/internal/observable/fromEvent';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Storage } from '@capacitor/storage';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  lat: number;
  lng: number;
  time: number;
  Data: any[] = [{time:1001200100, lat:111, lng:-111}];



  setItem(position) {
    console.log(`VALUE POS: ${position}`);
     Storage.set(
       {key: "test", value:`{ "timestamp":[${position.timestamp}, ${position.coords.latitude}, ${position.coords.longitude}]}`}
     ); 
     console.log(`AFTER STORAGE: ${position.timestamp}`);
  }

  getItem(){
    console.log("GET ITEM");
    Storage.get({key:"test"}).then(res =>{
    const obj = JSON.parse(res.value);
    console.log( `VALUE: ${res.value}, ${obj.timestamp[0]}`);
    });
  }


  constructor(
    public ngZone: NgZone,
    private db: DbService,
    public formBuilder: FormBuilder,
    private toast: ToastController,
    private router: Router,
    private geolocation: Geolocation,
    private nativeStorage: NativeStorage) {
    //this.lat = 38.897957;
    //this.lng = -77.036560;
    console.log("Before locatioin get");
    this.getLocation();
  }

  async getLocation() {
    console.log('[DEBUG] About to getCurrentPosition() ');
    const position = await this.geolocation.getCurrentPosition();
    console.log('[DEBUG] After getCurrentPosition()');
    
    this.lat = position.coords.latitude;
    this.lng = position.coords.longitude;
    this.setItem(position);
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
    this.geolocation.getCurrentPosition({
      enableHighAccuracy: true
    }).then((res) => {
      this.time = res.timestamp;
      this.lat = res.coords.latitude;
      this.lng = res.coords.longitude;
      //Store location
      this.db.addPlace(
        res.timestamp,
        res.coords.latitude,
        res.coords.longitude
      ).then(async (res) => {
        let toast = await this.toast.create({
          message: 'Location data and timestamp added',
          duration: 3000
        });
        toast.present();
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  

  deletePlace(time){
    this.db.deletePlace(time).then(async(res)=>{
      let toast = await this.toast.create({
        message:'Place deleted',
        duration: 2500
      });
      toast.present();
    })
  }
}
