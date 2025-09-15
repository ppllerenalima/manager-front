import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GetPerTributarioRequest } from 'src/app/pages/apps/compra-sire/Models/Requests/GetPerTributarioRequest';
import { PerTributarioResponse } from 'src/app/pages/apps/compra-sire/Models/Responses/PerTributarioResponse';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PerTributarioService {
  apiUrl = environment.apiUrl + '/PerTributario';
  http = inject(HttpClient);

  constructor() { }

  public getByPeriodo(request: GetPerTributarioRequest): Observable<PerTributarioResponse> {
    return this.http.get<PerTributarioResponse>(`${this.apiUrl}/buscar`, {
      params: {
        anio: request.anio,
        mes: request.mes,
        clienteId: request.clienteId
      }
    });
  }
}
