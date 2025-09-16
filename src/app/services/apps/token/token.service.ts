import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiManager}/Token`; // `apiUrl` debería estar en environment.ts

  constructor() {}

  /**
   * Obtiene o genera un token activo del cliente
   * @param clienteId GUID del cliente
   * @returns Token activo como string
   */
  getActiveToken(clienteId: string): Observable<string> {
    const url = `${this.baseUrl}/clientes/${clienteId}/token-activo`;

    return this.http.get<{ accessToken: string }>(url).pipe(
      map((response) => response.accessToken),
      catchError(this.handleError)
    );
  }

  /**
   * Maneja errores HTTP de forma centralizada
   */
  private handleError(error: HttpErrorResponse) {
    let mensaje = 'Ocurrió un error inesperado';

    if (error.status === 404) {
      mensaje = 'Cliente no encontrado';
    } else if (error.status === 502) {
      mensaje = 'Error al obtener el token desde SUNAT';
    } else if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o red
      mensaje = `Error de red: ${error.error.message}`;
    } else {
      // Error del backend
      mensaje = `Error del servidor: ${error.message}`;
    }

    return throwError(() => new Error(mensaje));
  }
}
