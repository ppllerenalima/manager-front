import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { PaginatedResponse } from 'src/app/shared/models/PaginatedResponse';
import { ComprobantePaginatedResponse } from 'src/app/pages/apps/compra-sire/Models/Responses/ComprobantePaginatedResponse';
import { ComprobanteImportarGlosaRequest } from 'src/app/pages/apps/compra-sire/Models/Requests/ComprobanteImportarGlosaRequest';

@Injectable({
  providedIn: 'root',
})
export class ComprobanteService {
  apiUrl = environment.apiManager + '/Comprobante';
  http = inject(HttpClient);

  constructor() {}

  public getsPaginated(
    id: string,
    search: string,
    pageSize: number,
    pageIndex: number
  ): Observable<PaginatedResponse<ComprobantePaginatedResponse>> {
    const params = new HttpParams()
      .set('perTributarioId', id)
      .set('search', search)
      .set('pageSize', pageSize)
      .set('pageIndex', pageIndex);

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
}
