import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Places } from './places';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';


@Injectable({
  providedIn: 'root'
})
export class DbService {

  private storage: SQLiteObject;
  placesList = new BehaviorSubject([]);
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private platform: Platform,
    private sqlite: SQLite,
    private httpClient: HttpClient,
    private sqlPorter: SQLitePorter
    ) {

      this.platform.ready().then(() => {
        this.init();
      });

     }

     init(){
      return this.sqlite.create(
        {
          name:'placesdb.db',
          location:'default'
        }
      ).then((db: SQLiteObject) => {
        this.storage = db;
        this.storage.executeSql('SELECT * FROM placestable', [])
        .then(res=>{
          if(res.rows.length > 0){
            this.getPlaces();
            this.isDbReady.next(true);
          }else{
            this.getFakeData();
          }
        })
        
      });
     }

     dbState(){
       return this.isDbReady.asObservable();
     }

     fetchPlaces(): Observable<Places[]>{
       return this.placesList.asObservable();
     }

     getFakeData(){
        this.httpClient.get(
          'assets/dump.sql',{responseType:'text'}
        ).subscribe(data => {
          this.sqlPorter.importSqlToDb(this.storage, data)
          .then(_ => {
            this.getPlaces();
            this.isDbReady.next(true);
          }).catch(error => {
            console.error(error);
          });
        });
     }

     getPlaces(){
        return this.storage.executeSql('SELECT * FROM placestable', [])
        .then(res=>{
          let items: Places[] = [];
          if(res.rows.length > 0){
            for(var i = 0; i < res.rows.length; i++){
              items.push(
                {
                  id: res.rows.item(i).id,
                  lat:res.rows.item(i).lat,
                  lng:res.rows.item(i).lng
                }
              );
            }
          }
          this.placesList.next(items);
        });
     }

     addPlace(lat, lng){
      let data = [lat, lng];
      return this.storage.executeSql(
        'INSERT INTO placestable(lat, lng) VALUES (?,?)', data)
        .then(res=>{
          this.getPlaces();
        });
     }

     updatePlace(id, places:Places){
       return this.storage.executeSql(
         `UPDATE placestable SET lat=?, lng=? WHERE id=${id}`, 
         [places.lat, places.lng]).then(data=>{
          this.getPlaces();
        });
     }

     deletePlace(id){
       return this.storage.executeSql('DELETE FROM placestable WHERE id=?',[id])
       .then(_ =>{
         this.getPlaces()
       })
     }

     getPlace(id): Promise<Places>{
       return this.storage.executeSql('SELECT * FROM placestable WHERE id=?', [id])
       .then(res=>{
         return {
           id: res.rows.item(0).id,
           lat: res.rows.item(0).lat,
           lng: res.rows.item(0).lng
         }
       });
     }
}
