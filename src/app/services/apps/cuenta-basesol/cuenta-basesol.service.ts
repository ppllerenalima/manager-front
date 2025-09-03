import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResponse } from 'src/app/shared/models/PaginatedResponse';

@Injectable({
  providedIn: 'root'
})
export class CuentaBasesolService {
  baseUrl = environment.baseUrl;

  http = inject(HttpClient);

  constructor() { }

  public getsPaginated(
    search?: string,
    pageSize?: number,
    pageIndex?: number
  ): Observable<PaginatedResponse<GrupoPaginated>> {
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

    return this.http.get<PaginatedResponse<GrupoPaginated>>(this.baseUrl, { params });
  }

  public add(addCuentaBaseSol: AddGrupo): Observable<any> {
    return this.http.post(this.baseUrl, addGrupo);
  }

  public getById(id: string): Observable<Grupo> {
    return this.http.get<Grupo>(`${this.baseUrl}/${id}`);
  }

  public update(id: string, editCuentaBaseSol: EditGrupo): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, editGrupo);
  }

  public delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
