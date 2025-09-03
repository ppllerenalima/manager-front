import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddCuentaBaseSol } from 'src/app/pages/apps/cuenta-basesol/models/AddCuentaBaseSol';
import { CuentaBaseSol } from 'src/app/pages/apps/cuenta-basesol/models/CuentaBaseSol';
import { CuentaBaseSolPaginated } from 'src/app/pages/apps/cuenta-basesol/models/CuentaBaseSolPaginated';
import { EditCuentaBaseSol } from 'src/app/pages/apps/cuenta-basesol/models/EditCuentaBaseSol';
import { PaginatedResponse } from 'src/app/shared/models/PaginatedResponse';

@Injectable({
  providedIn: 'root',
})
export class CuentaBaseSolService {
  private baseUrl = 'https://localhost:7149/api/CuentaBaseSol'; // cambia por tu URL real

  http = inject(HttpClient);

  constructor() { }

  public getsPaginated(
    search?: string,
    pageSize?: number,
    pageIndex?: number
  ): Observable<PaginatedResponse<CuentaBaseSolPaginated>> {
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

    return this.http.get<PaginatedResponse<CuentaBaseSolPaginated>>(this.baseUrl, { params });
  }

  public add(addCuentaBaseSol: AddCuentaBaseSol): Observable<any> {
    return this.http.post(this.baseUrl, addCuentaBaseSol);
  }

  public getById(id: string): Observable<CuentaBaseSol> {
    return this.http.get<CuentaBaseSol>(`${this.baseUrl}/${id}`);
  }

  public update(id: string, editCuentaBaseSol: EditCuentaBaseSol): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, editCuentaBaseSol);
  }

  public delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
