import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GetPerTributarioRequest } from 'src/app/pages/apps/compra-sire/Models/Requests/GetPerTributarioRequest';
import { PerTributarioResponse } from 'src/app/pages/apps/compra-sire/Models/Responses/PerTributarioResponse';
import { BaseResponseGeneric } from 'src/app/shared/models/BaseResponse';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PerTributarioService {
  apiUrl = environment.apiManager + '/PerTributario';
  http = inject(HttpClient);

  constructor() {}

  getByPeriodo(
    request: GetPerTributarioRequest
  ): Observable<BaseResponseGeneric<PerTributarioResponse>> {
    return this.http.get<BaseResponseGeneric<PerTributarioResponse>>(
      `${this.apiUrl}/buscar`,
      {
        params: {
          anio: request.anio,
          mes: request.mes,
          clienteId: request.clienteId,
        },
      }
    );
  }
}
