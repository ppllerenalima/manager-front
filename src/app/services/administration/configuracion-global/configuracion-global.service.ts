import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddConfiguracionGlobal } from 'src/app/pages/administration/configuracion-global/models/AddConfiguracionGlobal';
import { ConfiguracionGlobal } from 'src/app/pages/administration/configuracion-global/models/ConfiguracionGlobal';
import { ConfiguracionGlobalPaginated } from 'src/app/pages/administration/configuracion-global/models/ConfiguracionGlobalPaginated';
import { EditConfiguracionGlobal } from 'src/app/pages/administration/configuracion-global/models/EditConfiguracionGlobal';
import { BaseResponse } from 'src/app/shared/models/BaseResponse';
import { PaginatedResponse } from 'src/app/shared/models/PaginatedResponse';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionGlobalService {
  apiUrl = environment.apiManager + '/ConfiguracionGlobal';
  http = inject(HttpClient);

  constructor() {}

  public getsPaginated(
    search?: string,
    pageSize?: number,
    pageIndex?: number
  ): Observable<PaginatedResponse<ConfiguracionGlobalPaginated>> {
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

    return this.http.get<PaginatedResponse<ConfiguracionGlobalPaginated>>(
      this.apiUrl,
      { params }
    );
  }

  public add(addConfiguracionGlobal: AddConfiguracionGlobal): Observable<any> {
    return this.http.post(this.apiUrl, addConfiguracionGlobal);
  }

  public getFirstOrDefault(): Observable<BaseResponse<ConfiguracionGlobal>> {
    return this.http.get<BaseResponse<ConfiguracionGlobal>>(
      `${this.apiUrl}/FirstOrDefault`
    );
  }

  public getById(id: string): Observable<ConfiguracionGlobal> {
    return this.http.get<ConfiguracionGlobal>(`${this.apiUrl}/${id}`);
  }

  public update(
    id: string,
    editConfiguracionGlobal: EditConfiguracionGlobal
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, editConfiguracionGlobal);
  }

  public delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}