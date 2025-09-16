import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddRole } from 'src/app/pages/administration/role/models/AddRole';
import { EditRole } from 'src/app/pages/administration/role/models/EditRole';
import { Role } from 'src/app/pages/administration/role/models/Role';
import { RolePaginated } from 'src/app/pages/administration/role/models/RolePaginated';
import { PaginatedResponse } from 'src/app/shared/models/PaginatedResponse';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  apiUrl = environment.apiManager + '/Role';

  http = inject(HttpClient);

  constructor() {}

  public getsPaginated(
    search?: string,
    pageSize?: number,
    pageIndex?: number
  ): Observable<PaginatedResponse<RolePaginated>> {
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

    return this.http.get<PaginatedResponse<RolePaginated>>(this.apiUrl, {
      params,
    });
  }

  public gets(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/list`);
  }

  public add(addRole: AddRole): Observable<any> {
    return this.http.post(this.apiUrl, addRole);
  }

  public getById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  public update(id: string, editRole: EditRole): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, editRole);
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
