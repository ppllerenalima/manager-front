import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddGrupo } from 'src/app/pages/apps/grupo/models/AddGrupo';
import { Grupo } from 'src/app/pages/apps/grupo/models/Grupo';
import { GrupoPaginated } from 'src/app/pages/apps/grupo/models/GrupoPaginated';
import { EditGrupo } from 'src/app/pages/apps/grupo/models/EditGrupo';
import { PaginatedResponse } from 'src/app/shared/models/PaginatedResponse';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GrupoService {
  apiUrl = environment.apiManager + '/Grupo';
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

    return this.http.get<PaginatedResponse<GrupoPaginated>>(this.apiUrl, { params });
  }

  public add(addGrupo: AddGrupo): Observable<any> {
    return this.http.post(this.apiUrl, addGrupo);
  }

  public getById(id: string): Observable<Grupo> {
    return this.http.get<Grupo>(`${this.apiUrl}/${id}`);
  }

  public update(id: string, editGrupo: EditGrupo): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, editGrupo);
  }

  public delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
