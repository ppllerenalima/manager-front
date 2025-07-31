import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from 'src/app/pages/apps/cliente/models/cliente';
import { clientePaginated } from 'src/app/pages/apps/cliente/models/clientePaginated';
import { PaginatedResponse } from 'src/app/shared/models/PaginatedResponse';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private baseUrl = 'https://localhost:7149/api/Cliente'; // cambia por tu URL real

  http = inject(HttpClient);

  constructor() { }

  public getsPaginated(
    search: string,
    pageSize: number,
    pageIndex: number
  ): Observable<PaginatedResponse<clientePaginated>> {
    const params = new HttpParams()
      .set('search', search)
      .set('pageSize', pageSize)
      .set('pageIndex', pageIndex);

    return this.http.get<PaginatedResponse<clientePaginated>>(this.baseUrl, { params });
  }

  public add(cliente: Cliente): Observable<any> {
    return this.http.post(this.baseUrl, cliente);
  }

  public getById(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${id}`);
  }

  public update(id: string, cliente: Cliente): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, cliente);
  }

  public delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
