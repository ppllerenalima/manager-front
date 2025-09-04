import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddUsuario } from 'src/app/pages/administration/usuario/models/AddUsuario';
import { EditUsuario } from 'src/app/pages/administration/usuario/models/EditUsuario';
import { Usuario } from 'src/app/pages/administration/usuario/models/Usuario';
import { UsuarioPaginated } from 'src/app/pages/administration/usuario/models/UsuarioPaginated';
import { PaginatedResponse } from 'src/app/shared/models/PaginatedResponse';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  apiUrl = environment.apiUrl + '/User';

  http = inject(HttpClient);

  constructor() {}

  public getsPaginated(
    search?: string,
    pageSize?: number,
    pageIndex?: number
  ): Observable<PaginatedResponse<UsuarioPaginated>> {
    let params = new HttpParams();

    if (search) {
      params = params.set('search', search);
    }
    if (pageSize != null) {
      params = params.set('pageSize', pageSize.toString());
    }
    if (pageIndex != null) {
      params = params.set('pageIndex', pageIndex.toString());
    }

    return this.http.get<PaginatedResponse<UsuarioPaginated>>(this.apiUrl, {
      params,
    });
  }

  public add(addUsuario: AddUsuario): Observable<any> {
    return this.http.post(this.apiUrl, addUsuario);
  }

  public getById(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  public update(id: string, editUsuario: EditUsuario): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, editUsuario);
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
