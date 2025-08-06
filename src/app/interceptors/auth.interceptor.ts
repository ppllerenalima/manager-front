import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/authentication/Auth.service';
import { finalize, tap } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  let clonedRequest = req;
  if (token) {
    clonedRequest = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
  }
  return next(clonedRequest);
};

export const loadingScreenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  authService.loading.set(true); // Activa el loading cuando empieza la petición

  return next(req).pipe(
    finalize(() => {
      authService.loading.set(false); // Se desactiva al finalizar la petición
    })
  );
};
