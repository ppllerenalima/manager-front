import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConsultaCpeArchivoRequest } from 'src/app/pages/apps/invoice-view/Models/Requests/ConsultaCpeArchivoRequest';
import { ConsultaCpeRequest } from 'src/app/pages/apps/invoice-view/Models/Requests/ConsultaCpeRequest';
import { ControlCpeConsultaXmlRequest } from 'src/app/pages/apps/invoice-view/Models/Requests/ControlCpeConsultaXmlRequest';
import { ConsultaCpeComprobanteResponse } from 'src/app/pages/apps/invoice-view/Models/Responses/ConsultaCpeComprobanteResponse ';
import { ConsultaCpeUnificadoResponse } from 'src/app/pages/apps/invoice-view/Models/Responses/ConsultaCpeUnificadoResponse';
/**
 * Interface para la solicitud de consulta del estado del CPE (Comprobante de Pago Electrónico).
 */
export interface ConsultarCpeRequest {
  rucConsulta: string; // RUC del usuario que realiza la consulta
  username: string; // Usuario para autenticación
  password: string; // Contraseña para autenticación
  rucEmisor: string; // RUC del emisor del comprobante
  tipoComprobante: string; // Tipo de comprobante (ej. 01=Factura, 03=Boleta)
  serie: string; // Serie del comprobante
  numero: string; // Número del comprobante
}

export interface ConsultaTipoZipRequest {
  token: string; // Token de autorización obtenido previamente
  rucEmisor: string; // RUC del emisor del comprobante
  tipoComprobante: string; // Tipo de comprobante (ej. 01=Factura)
  serie: string; // Serie del comprobante
  numero: number;
  tipo: string; // Número del comprobante
}

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  // URL base del backend (ajustar según entorno real)
  private baseUrl = 'https://localhost:7149/api/Cpe';

  // Subject para almacenar y compartir el comprobante seleccionado
  private selectedComprobanteSubject = new BehaviorSubject<any | null>(null);
  // Observable que expone el comprobante seleccionado para otros componentes
  selectedComprobante$ = this.selectedComprobanteSubject.asObservable();

  private infoComprobanteSubject =
    new BehaviorSubject<ConsultaCpeArchivoRequest | null>(null);
  infoComprobante$ = this.infoComprobanteSubject.asObservable();

  private tokenSubject = new BehaviorSubject<string | null>(null);
  token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) { }

  setSelectedComprobante(comprobante: any): void {
    this.selectedComprobanteSubject.next(comprobante);
  }

  getSelectedComprobante(): any | null {
    return this.selectedComprobanteSubject.getValue();
  }

  setInfoComprobante(registro: ConsultaCpeArchivoRequest): void {
    this.infoComprobanteSubject.next(registro);
  }

  getInfoComprobante(): ConsultaCpeArchivoRequest | null {
    return this.infoComprobanteSubject.getValue();
  }

  statusCdr(request: ConsultarCpeRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/status-cdr`, request);
  }

  controlCpeConsultaXml(
    token: string,
    request: ControlCpeConsultaXmlRequest
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<ConsultaCpeComprobanteResponse>(
      `${this.baseUrl}/controlcpe-consultaxml`,
      request,
      { headers }
    );
  }

  consultaCpeComprobante(
    request: ConsultaCpeArchivoRequest
  ): Observable<ConsultaCpeComprobanteResponse> {
    return this.http.post<ConsultaCpeComprobanteResponse>(
      `${this.baseUrl}/consultacpe-comprobante`,
      request
    );
  }

  consultaCpeUnificado(
    request: ConsultaCpeRequest
  ): Observable<ConsultaCpeUnificadoResponse> {

    return this.http.post<ConsultaCpeUnificadoResponse>(
      `${this.baseUrl}/consultacpe-unificado`,
      request
    );
  }
}
