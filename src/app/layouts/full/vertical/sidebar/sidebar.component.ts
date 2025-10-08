import { Component, EventEmitter, Input, OnInit, Output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrandingComponent } from './branding.component';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { AuthService } from 'src/app/services/authentication/Auth.service';
import { NavItem } from './nav-item/nav-item';
import { navItems } from './sidebar-data';
import { AppNavItemComponent } from "./nav-item/nav-item.component";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BrandingComponent,
    TablerIconsModule,
    MaterialModule,
    AppNavItemComponent
],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  @Input() showToggle = true;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  filteredNavItems: NavItem[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const role = this.authService.getRole()?.toUpperCase() || 'USUARIO';
    console.log('🔹 Rol detectado:', role);

    this.filteredNavItems = this.filterMenuByRole(navItems, role);

    console.log('🔹 Menú filtrado:', this.filteredNavItems);
  }

  /**
   * Filtra los ítems y sus hijos según el rol del usuario.
   */
  private filterMenuByRole(items: NavItem[], role: string): NavItem[] {
    return items
      .filter((item) => {
        // Si no tiene roles, lo mostramos
        if (!item.roles) return true;

        // Si tiene roles, el actual debe coincidir (sin importar mayúsculas/minúsculas)
        return item.roles.some((r) => r.toUpperCase() === role);
      })
      .map((item) => ({
        ...item,
        // Filtramos recursivamente los hijos
        children: item.children ? this.filterMenuByRole(item.children, role) : [],
      }));
  }

  trackByFn(index: number, item: NavItem) {
    return item.displayName || index;
  }
}
