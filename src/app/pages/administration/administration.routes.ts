import { Routes } from '@angular/router';

import { AppUsuarioComponent } from './usuario/usuario.component';
import { AppCuentaBasesolComponent } from './cuenta-basesol/cuenta-basesol.component';

export const AdministrationRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'usuario',
        component: AppUsuarioComponent,
        data: {
          title: 'Usuario',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Usuario' },
          ],
        },
      },
      {
        path: 'cuenta-basesol',
        component: AppCuentaBasesolComponent,
        data: {
          title: 'Cuenta-BaseSOL',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Cuenta-BaseSOL' },
          ],
        },
      },
    ],
  },
];
