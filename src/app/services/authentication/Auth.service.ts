import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

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
  userId: string;

  userName: string;
  email: string;
  fullName: string;
  role: string;
}

export interface JwtPayload {
  sub: string; // id del usuario (si lo incluyes en el token)
  email?: string; // email
  unique_name?: string; // username
  role?: string; // rol (si lo incluyes en claims)
  exp?: number; // fecha de expiración
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /** URL base de autenticación */
  apiUrl = environment.apiManager + '/User';

  /** Clave donde se guarda el token en localStorage */
  private readonly tokenKey = 'token';

  /** Estado global de carga (para mostrar spinners en la UI) */
  loading = signal(false);

  /** Estado reactivo de sesión (true si existe token) */
  isLoggedIn = signal<boolean>(!!localStorage.getItem(this.tokenKey));

  /** Usuario actual en toda la aplicación */
  currentUser = signal<TokenResponse | null>(
    localStorage.getItem('currentUser')
      ? JSON.parse(localStorage.getItem('currentUser')!)
      : null
  );

  constructor(private http: HttpClient) {}

  // ──────────────── MÉTODOS DE AUTENTICACIÓN ────────────────

  /**
   * Inicia sesión enviando credenciales al backend
   * @param request { userName, password }
   * @returns Observable con el TokenResponse
   */
  signIn(request: SignInRequest): Observable<TokenResponse> {
    this.loading.set(true);

    return this.http.post<TokenResponse>(`${this.apiUrl}/auth`, request).pipe(
      tap((token) => {
        // guardamos token
        this.saveToken(token.accessToken);

        // guardamos usuario completo
        localStorage.setItem('currentUser', JSON.stringify(token));
        this.currentUser.set(token); // 🔹 actualizamos el signal
      }),
      tap(() => this.loading.set(false))
    );
  }

  /**
   * Guarda el token en localStorage y actualiza el estado de sesión
   */
  private saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.isLoggedIn.set(true);
  }

  /**
   * Elimina el token del almacenamiento y actualiza el estado de sesión
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('currentUser');
    this.isLoggedIn.set(false);
    this.currentUser.set(null); // 🔹 limpiar usuario
  }

  // ──────────────── MÉTODOS DE CONSULTA ────────────────

  /**
   * Devuelve el token actual o null si no existe
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Devuelve el token decodificado como objeto (claims del JWT)
   * o null si no existe.
   */
  getDecodedToken(): JwtPayload | null {
    const token = localStorage.getItem(this.tokenKey);
    return token ? jwtDecode<JwtPayload>(token) : null;
  }

  /**
   * Indica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
