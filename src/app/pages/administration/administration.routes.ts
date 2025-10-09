import { Routes } from '@angular/router';

import { AppUsuarioComponent } from './usuario/usuario.component';
import { AppCuentaBasesolComponent } from './cuenta-basesol/cuenta-basesol.component';
import { AppConfiguracionGlobalComponent } from './configuracion-global/configuracion-global.component';
import { AppCuentaComponent } from './cuenta/cuenta.component';

export const AdministrationRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'configuracion-global',
        component: AppConfiguracionGlobalComponent,
        data: {
          title: 'Configuración-Global',
          urls: [{ title: 'Dashboard' }, { title: 'Configuración-Global' }],
        },
      },
      {
        path: 'cuenta',
        component: AppCuentaComponent,
        data: {
          title: 'Cuenta',
          urls: [{ title: 'Dashboard' }, { title: 'Cuenta' }],
        },
      },
      {
        path: 'cuenta-basesol',
        component: AppCuentaBasesolComponent,
        data: {
          title: 'Cuenta-BaseSOL',
          urls: [{ title: 'Dashboard' }, { title: 'Cuenta-BaseSOL' }],
        },
      },
      {
        path: 'usuario',
        component: AppUsuarioComponent,
        data: {
          title: 'Usuario',
          urls: [{ title: 'Dashboard' }, { title: 'Usuario' }],
        },
      },
    ],
  },
];
