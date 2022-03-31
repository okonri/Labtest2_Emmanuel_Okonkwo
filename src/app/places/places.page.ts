
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from "@angular/forms";
import { DbService } from './../services/db.service';
import { ActivatedRoute, Router } from "@angular/router";
@Component({
  selector: 'app-places',
  templateUrl: './places.page.html',
  styleUrls: ['./places.page.scss'],
})
export class PlacesPage implements OnInit {
  editForm: FormGroup;
  id: any;
  constructor(
    private db: DbService,
    private router: Router,
    public formBuilder: FormBuilder,
    private actRoute: ActivatedRoute
  ) {
    this.id = this.actRoute.snapshot.paramMap.get('id');
    this.db.getPlaces(this.id).then(res => {
      this.editForm.setValue({
        lat: res['lat'],
        lng: res['lng']
      })
    })
  }
  ngOnInit() {
    this.editForm = this.formBuilder.group({
      lat: [''],
      lng: ['']
    })
  }
  saveForm(){
    this.db.updatePlace(this.id, this.editForm.value)
    .then( (res) => {
      console.log(res)
      this.router.navigate(['/home']);
    })
  }
}