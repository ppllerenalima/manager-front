import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { Router, NavigationEnd, ActivatedRoute, Data } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterModule, TablerIconsModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: [],
})
export class AppBreadcrumbComponent {
  // @Input() layout;
  pageInfo: Data | any = Object.create(null);
  myurl: any = this.router.url.slice(1).split('/');
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {
    this.router.events
      // 1. Filtrar solo los eventos de navegación que terminan (`NavigationEnd`)
      .pipe(filter((event) => event instanceof NavigationEnd))

      // 2. Obtener la ruta activa en ese momento (`ActivatedRoute`)
      .pipe(map(() => this.activatedRoute))

      // 3. Navegar al hijo más profundo dentro de la ruta activa.
      // Esto se hace para asegurarse de trabajar con la última ruta (más específica)
      .pipe(
        map((route) => {
          // Recorre las rutas hijas hasta llegar a la última
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route; // Retorna la ruta más específica
        })
      )

      // 4. Filtrar solo la ruta que pertenece al outlet principal.
      // Ignora rutas de outlets secundarios u otros.
      .pipe(filter((route) => route.outlet === 'primary'))

      // 5. Acceder a los datos definidos en la configuración de la ruta.
      // `route.data` contiene información como el título de la página.
      .pipe(mergeMap((route) => route.data))

      // 6. Suscribirse al flujo de eventos para ejecutar acciones
      .subscribe((event) => {
        // 6.1 Actualizar el título de la página usando los datos de la ruta
        // Se concatena el título definido en la ruta con " - Angular 19"
        this.titleService.setTitle(event['title'] + ' - Angular 19');

        // 6.2 Guardar los datos de la ruta en la variable `pageInfo` para usar en otras partes del componente
        this.pageInfo = event;
      });
  }
}
