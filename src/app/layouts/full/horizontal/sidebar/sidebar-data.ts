import { NavItem } from '../../vertical/sidebar/nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Administracion',
    roles: ['ADMINISTRADOR', 'USUARIO'],
  },
  {
    displayName: 'Configuración Global',
    iconName: 'lock-access',
    route: 'administration/configuracion-global',
    roles: ['ADMINISTRADOR'],
  },
  {
    displayName: 'Cuenta',
    iconName: 'lock-access',
    route: 'administration/cuenta',
    roles: ['ADMINISTRADOR', 'USUARIO'],
  },
  {
    displayName: 'Usuario',
    iconName: 'aperture',
    route: 'administration/usuario',
    roles: ['ADMINISTRADOR'],
  },
  {
    navCap: 'Procesos',
    roles: ['ADMINISTRADOR', 'USUARIO'],
  },
  {
    displayName: 'Grupo',
    iconName: 'file-invoice',
    route: '',
    roles: ['ADMINISTRADOR', 'USUARIO'],
    children: [
      {
        displayName: 'List',
        iconName: 'point',
        route: '/apps/grupo',
        roles: ['ADMINISTRADOR', 'USUARIO'],
      },
    ],
  },
  {
    displayName: 'Cliente',
    iconName: 'tags',
    route: 'apps/cliente',
    roles: ['ADMINISTRADOR', 'USUARIO'],
  },
];