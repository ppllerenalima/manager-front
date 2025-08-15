import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GrupoPaginated } from 'src/app/pages/apps/grupo/models/grupoPaginated';
import { AddGrupo } from 'src/app/pages/apps/grupo/models/AddGrupo';
import { Grupo } from 'src/app/pages/apps/grupo/models/Grupo';
import { PaginatedResponse } from 'src/app/shared/models/PaginatedResponse';
import { EditGrupo } from 'src/app/pages/apps/grupo/models/EditGrupo';

@Injectable({
  providedIn: 'root',
})
export class GrupoService {
  private baseUrl = 'https://localhost:7149/api/Grupo'; // cambia por tu URL real

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

  // public getsPaginated(
  //   search: string,
  //   pageSize: number,
  //   pageIndex: number
  // ): Observable<PaginatedResponse<GrupoPaginated>> {
  //   const params = new HttpParams()
  //     .set('search', search)
  //     .set('pageSize', pageSize)
  //     .set('pageIndex', pageIndex);

  //   return this.http.get<PaginatedResponse<GrupoPaginated>>(this.baseUrl, {
  //     params,
  //   });
  // }

  public add(addGrupo: AddGrupo): Observable<any> {
    return this.http.post(this.baseUrl, addGrupo);
  }

  public getById(id: string): Observable<Grupo> {
    return this.http.get<Grupo>(`${this.baseUrl}/${id}`);
  }

  public update(id: string, editGrupo: EditGrupo): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, editGrupo);
  }

  public delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
