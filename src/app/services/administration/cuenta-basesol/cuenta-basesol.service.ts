import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddCuentaBaseSol } from 'src/app/pages/administration/cuenta-basesol/models/AddCuentaBaseSol';
import { CuentaBaseSol } from 'src/app/pages/administration/cuenta-basesol/models/CuentaBaseSol';
import { CuentaBaseSolPaginated } from 'src/app/pages/administration/cuenta-basesol/models/CuentaBaseSolPaginated';
import { EditCuentaBaseSol } from 'src/app/pages/administration/cuenta-basesol/models/EditCuentaBaseSol';
import { BaseResponse, BaseResponseGeneric } from 'src/app/shared/models/BaseResponse';
import { PaginatedResponse } from 'src/app/shared/models/PaginatedResponse';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CuentaBaseSolService {
  apiUrl = environment.apiManager + '/CuentaBaseSol';
  http = inject(HttpClient);

  constructor() {}

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

    return this.http.get<PaginatedResponse<CuentaBaseSolPaginated>>(
      this.apiUrl,
      { params }
    );
  }

  public add(addCuentaBaseSol: AddCuentaBaseSol): Observable<any> {
    return this.http.post(this.apiUrl, addCuentaBaseSol);
  }

  public getFirstOrDefault(): Observable<BaseResponseGeneric<CuentaBaseSol>> {
    return this.http.get<BaseResponseGeneric<CuentaBaseSol>>(
      `${this.apiUrl}/FirstOrDefault`
    );
  }

  public getById(id: string): Observable<CuentaBaseSol> {
    return this.http.get<CuentaBaseSol>(`${this.apiUrl}/${id}`);
  }

  public update(
    id: string,
    editCuentaBaseSol: EditCuentaBaseSol
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, editCuentaBaseSol);
  }

  public delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
