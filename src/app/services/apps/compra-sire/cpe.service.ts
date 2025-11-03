import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClientePermisoRequestDto } from 'src/app/pages/apps/cliente/models/ClientePermisoRequestDto';
import { Cpe_DescargarZipRequest } from 'src/app/pages/apps/compra-sire/Models/Requests/Cpe_DescargarZipRequest';
import { BaseResponseGeneric } from 'src/app/shared/models/BaseResponse';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CpeService {
  apiUrl = environment.apiManager + '/Cpe';
  http = inject(HttpClient);

  constructor() {}

  descargarPdf(
    clienteId: string,
    request: Cpe_DescargarZipRequest
  ): Observable<Blob> {
    const params = new HttpParams().set('clienteId', clienteId);

    return this.http.post(`${this.apiUrl}/descargar-zip-pdf`, request, {
      params,
      responseType: 'blob', // 👈 importante para recibir el PDF binario
    });
  }

  actualizarPermisos(
    request: ClientePermisoRequestDto
  ): Observable<BaseResponseGeneric<string>> {
    const params = new HttpParams()
      .set('token', request.token)
      .set('id', request.id)
      .set('nomApp', request.nomApp)
      .set('desUrlApp', request.desUrlApp);

    return this.http.put<BaseResponseGeneric<string>>(
      `${this.apiUrl}/actualizar-permisos`,
      null,
      { params }
    );
  }
}
