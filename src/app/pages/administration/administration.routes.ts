import { Routes } from '@angular/router';

import { AppUsuarioComponent } from './usuario/usuario.component';

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
    ],
  },
];
