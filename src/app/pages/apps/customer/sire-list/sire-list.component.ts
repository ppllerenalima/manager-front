import { Component, OnInit, signal } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AppListingComponent } from './listing/listing.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sire-list',
  imports: [AppListingComponent, TablerIconsModule, MaterialModule],
  templateUrl: './sire-list.component.html',
})
export class AppSireListComponent implements OnInit {
  id = signal<any>(null);
  username = signal<any>(null);
  password = signal<any>(null);
  

  constructor(
    activatedRouter: ActivatedRoute
  ) {
    this.id.set(activatedRouter.snapshot.paramMap.get('id'));
    this.username.set(activatedRouter.snapshot.paramMap.get('username'));
    this.password.set(activatedRouter.snapshot.paramMap.get('password'));

  }

  ngOnInit(): void {

  }
}