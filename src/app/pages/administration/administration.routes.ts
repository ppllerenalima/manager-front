import { Routes } from '@angular/router';

import { AppUsuarioComponent } from './usuario/usuario.component';
import { AppCuentaBasesolComponent } from './cuenta-basesol/cuenta-basesol.component';
import { AppConfiguracionGlobalComponent } from './configuracion-global/configuracion-global.component';

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
            { title: 'Dashboard' },
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
            { title: 'Dashboard' },
            { title: 'Cuenta-BaseSOL' },
          ],
        },
      },
      {
        path: 'configuracion-global',
        component: AppConfiguracionGlobalComponent,
        data: {
          title: 'Configuración-Global',
          urls: [
            { title: 'Dashboard' },
            { title: 'Configuración-Global' },
          ],
        },
      },
    ],
  },
];
