import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

export interface SignInRequest {
  userName: string;
  password: string;
}

export interface TokenResponse {
  id: string;
  accessToken: string;
  fechaGeneracion: string;
  fechaExpiracion: string;
  isInactive: boolean;
  clienteId: string;
}


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://localhost:7149/api/user/auth'; // Ajusta tu puerto

  private readonly tokenKey = 'token';

  loading = signal(false); // Estado global de carga

  // Opción pro: usar signal para estado reactivo
  isLoggedIn = signal<boolean>(!!localStorage.getItem(this.tokenKey));

  constructor(private http: HttpClient) { }

  signIn(request: SignInRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(this.apiUrl, request).pipe(
      tap((response) => {
        if (response.accessToken) {
          // Guardamos el token para que el guard lo use
          localStorage.setItem('token', response.accessToken);
        }
      })
    );
  }

  signOut(): void {
    localStorage.removeItem('token');
  }

  /** Devuelve el token actual */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** Valida si el usuario está logueado */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  /** Guarda token y actualiza estado */
  login(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.isLoggedIn.set(true);
  }

  /** Cierra sesión */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isLoggedIn.set(false);
  }
}
