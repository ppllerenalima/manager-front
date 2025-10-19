import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from 'src/app/pages/apps/cliente/models/cliente';
import { clientePaginated } from 'src/app/pages/apps/cliente/models/clientePaginated';
import { ClienteRequestDto } from 'src/app/pages/apps/cliente/models/ClienteRequestDto';
import { PaginatedResponse } from 'src/app/shared/models/PaginatedResponse';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  apiUrl = environment.apiManager + '/Cliente';
  http = inject(HttpClient);

  constructor() {}

  public getPaginated(
    search: string = '',
    pageSize: number = 10,
    pageIndex: number = 0,
    grupoId?: string, // 👈 opcional
    userId?: string // 👈 opcional
  ): Observable<PaginatedResponse<clientePaginated>> {
    let params = new HttpParams()
      .set('search', search)
      .set('pageSize', pageSize)
      .set('pageIndex', pageIndex);

    if (grupoId) {
      params = params.set('grupoId', grupoId);
    }

    if (userId) {
      params = params.set('userId', userId);
    }

    return this.http.get<PaginatedResponse<clientePaginated>>(this.apiUrl, {
      params,
    });
  }

  public add(cliente: ClienteRequestDto): Observable<any> {
    return this.http.post(this.apiUrl, cliente);
  }

  public getById(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  public update(id: string, cliente: ClienteRequestDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, cliente);
  }

  public delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
