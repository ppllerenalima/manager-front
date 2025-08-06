
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/authentication/Auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ✅ Si está autenticado, dejamos pasar
  if (authService.isAuthenticated()) return true;

  // ❌ Si no está autenticado, devolvemos una UrlTree (Angular recomienda esto)
  return router.createUrlTree(['/authentication/login'], {
    queryParams: { returnUrl: state.url } // Guarda la ruta que quiso visitar
  });
};
