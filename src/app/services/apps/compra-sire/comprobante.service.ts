import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { PaginatedResponse } from 'src/app/shared/models/PaginatedResponse';
import { ComprobantePaginatedResponse } from 'src/app/pages/apps/compra-sire/Models/Responses/ComprobantePaginatedResponse';
import { ComprobanteImportarGlosaRequest } from 'src/app/pages/apps/compra-sire/Models/Requests/ComprobanteImportarGlosaRequest';
import { BaseResponse } from 'src/app/shared/models/BaseResponse';
import { ComprobanteContadoresResponse } from 'src/app/pages/apps/compra-sire/Models/Responses/ComprobanteContadoresResponse';
import { EditComprobanteRequest } from 'src/app/pages/apps/compra-sire/Models/Requests/EditComprobanteRequest';

@Injectable({
  providedIn: 'root',
})
export class ComprobanteService {
  apiUrl = environment.apiManager + '/Comprobante';
  http = inject(HttpClient);

  constructor() {}

  public getsPaginated(
    id: string,
    tieneGlosa: boolean | null,
    search: string,
    pageSize: number,
    pageIndex: number
  ): Observable<PaginatedResponse<ComprobantePaginatedResponse>> {
    let params = new HttpParams()
      .set('perTributarioId', id)
      .set('search', search)
      .set('pageSize', pageSize)
      .set('pageIndex', pageIndex);

    if (tieneGlosa !== null) {
      params = params.set('tieneGlosa', tieneGlosa.toString()); // "true" o "false"
    }

    return this.http.get<PaginatedResponse<ComprobantePaginatedResponse>>(
      this.apiUrl,
      {
        params,
      }
    );
  }

  public importarGlosa(
    request: ComprobanteImportarGlosaRequest
  ): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/importar-glosa`, request);
  }

  public update(
      id: string,
      editComprobante: EditComprobanteRequest
    ): Observable<any> {
      return this.http.put(`${this.apiUrl}/${id}`, editComprobante);
    }

  public getContadores(
    perTributarioId: string
  ): Observable<BaseResponse<ComprobanteContadoresResponse>> {
    const params = new HttpParams().set('perTributarioId', perTributarioId);

    return this.http.get<BaseResponse<ComprobanteContadoresResponse>>(
      `${this.apiUrl}/contadores`,
      { params }
    );
  }
}
