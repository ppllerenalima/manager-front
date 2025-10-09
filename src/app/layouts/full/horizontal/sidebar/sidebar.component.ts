import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  OnChanges,
} from '@angular/core';
import { navItems } from './sidebar-data';
import { Router } from '@angular/router';
import { NavService } from '../../../../services/nav.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { AppHorizontalNavItemComponent } from './nav-item/nav-item.component';
import { CommonModule } from '@angular/common';
import { NavItem } from '../../vertical/sidebar/nav-item/nav-item';
import { AuthService } from 'src/app/services/authentication/Auth.service';

@Component({
  selector: 'app-horizontal-sidebar',
  imports: [AppHorizontalNavItemComponent, CommonModule],
  templateUrl: './sidebar.component.html',
})
export class AppHorizontalSidebarComponent implements OnInit {
  navItems = navItems;
  parentActive = '';

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  filteredNavItems: NavItem[] = [];

  constructor(
    public navService: NavService,
    public router: Router,
    media: MediaMatcher,
    changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService
  ) {
    this.mobileQuery = media.matchMedia('(min-width: 1100px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.router.events.subscribe(
      () => (this.parentActive = this.router.url.split('/')[1])
    );
  }

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
        children: item.children
          ? this.filterMenuByRole(item.children, role)
          : [],
      }));
  }

  trackByFn(index: number, item: NavItem) {
    return item.displayName || index;
  }
}
