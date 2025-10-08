import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Administracion',
    roles: ['ADMINISTRADOR'],
  },
  {
    displayName: 'Usuario',
    iconName: 'aperture',
    route: 'administration/usuario',
    roles: ['ADMINISTRADOR'],
  },
  {
    displayName: 'Configuración Global',
    iconName: 'lock-access',
    route: 'administration/configuracion-global',
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


// export const navItems: NavItem[] = [
//   {
//     navCap: 'Administracion',
//   },
//   {
//     displayName: 'Usuario',
//     iconName: 'aperture',
//     route: 'administration/usuario',
//   },
//   {
//     displayName: 'Configuración Global',
//     iconName: 'lock-access',
//     route: 'administration/configuracion-global',
//   },
//   {
//     navCap: 'Procesos',
//   },
//   {
//     displayName: 'Grupo',
//     iconName: 'file-invoice',
//     route: '',
//     children: [
//       {
//         displayName: 'List',
//         iconName: 'point',
//         route: '/apps/grupo',
//       },
//     ],
//   },
//   {
//     displayName: 'Cliente',
//     iconName: 'tags',
//     route: 'apps/cliente',
//   },
// ];
