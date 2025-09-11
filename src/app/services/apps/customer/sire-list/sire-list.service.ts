import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ArchivoReporteRequest } from 'src/app/pages/apps/compra-sire/Models/Requests/ArchivoReporteRequest';
import { PerTributarioResponse } from 'src/app/pages/apps/compra-sire/Models/Responses/PerTributarioResponse';
import { environment } from 'src/environments/environment';

export interface AceptarPropuestaRequest {
  accessToken: string;
  periodoTributario: string;
}

export interface DescargarPropuestaRequest {
  token: string;
  perTributario: string;
  codTipoArchivo: number;
  codOrigenEnvio: string;
  numSerieCDP?: string;
  numCDP?: string;
  fecEmisionIni?: string;
  fecEmisionFin?: string;
  codTipoCDP?: string;
  codInconsistencia?: string;
  codCar?: string;
  numDocAdquiriente?: string;
  mtoDesde?: number;
  mtoHasta?: number;
}

export interface ConsultarEstadoTicketRequest {
  accessToken: string;
  perIni: string;
  perFin: string;
  page: number;
  perPage: number;
  numTicket?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SireService {
  apiUrl = environment.apiUrl + '/SireCompras';
  http = inject(HttpClient);

  constructor() {}

  getToken(clienteId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${clienteId}/token`);
  }

  aceptarPropuesta(request: AceptarPropuestaRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/aceptar-propuesta`, request);
  }

  descargarPropuesta(request: DescargarPropuestaRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/descargar-propuesta`, request);
  }

  consultarEstadoTicket(
    request: ConsultarEstadoTicketRequest
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/consultar-estado-ticket`, request);
  }

  importarComprobantes(
    request: ArchivoReporteRequest
  ): Observable<PerTributarioResponse> {
    return this.http.post<PerTributarioResponse>(
      `${this.apiUrl}/importar-comprobantes`,
      request
    );
  }
}
