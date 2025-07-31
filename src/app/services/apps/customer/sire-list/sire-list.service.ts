import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

export interface DescargarArchivoReporteRequest {
  token: string;
  nomArchivoReporte: string;
  codTipoArchivoReporte: string;
  codLibro?: string;
  perTributario: string;
  codProceso: string;
  numTicket: string;
}

@Injectable({
  providedIn: 'root'
})
export class SireService {

  private baseUrl = 'https://localhost:7149/api/SireCompras'; // cambia por tu URL real

  constructor(private http: HttpClient) { }

  getToken(clienteId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${clienteId}/token`);
  }

  aceptarPropuesta(request: AceptarPropuestaRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/aceptar-propuesta`, request);
  }

  descargarPropuesta(request: DescargarPropuestaRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/descargar-propuesta`, request);
  }

  consultarEstadoTicket(request: ConsultarEstadoTicketRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/consultar-estado-ticket`, request);
  }

  descargarArchivoReporte(request: DescargarArchivoReporteRequest): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/descargar-archivo`, request, {
      responseType: 'blob'
    });
  }
}
