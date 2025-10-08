import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrandingComponent } from './branding.component';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { AuthService } from 'src/app/services/authentication/Auth.service';
import { NavItem } from './nav-item/nav-item';
import { navItems } from './sidebar-data';
import { AppNavItemComponent } from './nav-item/nav-item.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BrandingComponent,
    TablerIconsModule,
    MaterialModule,
  ],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  @Input() showToggle = true;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {}
}
