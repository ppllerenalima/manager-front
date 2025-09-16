import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  Observable,
} from 'rxjs';
import { ConsultaCpeArchivoRequest } from 'src/app/pages/apps/invoice-view/Models/Requests/ConsultaCpeArchivoRequest';
import { ConsultaCpeRequest } from 'src/app/pages/apps/invoice-view/Models/Requests/ConsultaCpeRequest';
import { ControlCpeConsultaXmlRequest } from 'src/app/pages/apps/invoice-view/Models/Requests/ControlCpeConsultaXmlRequest';
import { ConsultaCpeComprobanteResponse } from 'src/app/pages/apps/invoice-view/Models/Responses/ConsultaCpeComprobanteResponse ';
import { ConsultaCpeUnificadoResponse } from 'src/app/pages/apps/invoice-view/Models/Responses/ConsultaCpeUnificadoResponse';
import { environment } from 'src/environments/environment';
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
  apiUrl = environment.apiManager + '/Cpe';
  http = inject(HttpClient);

  private selectedComprobanteSubject = new BehaviorSubject<string | null>(null);

  /**
   * Observable que emite solo comprobantes válidos (no nulos y no vacíos)
   */
  selectedComprobante$ = this.selectedComprobanteSubject.asObservable().pipe(
    filter(
      (comprobante): comprobante is string =>
        !!comprobante && comprobante.length > 10
    ),
    distinctUntilChanged() // ✅ evita emitir dos veces el mismo comprobante
  );

  /**
   * Asigna el comprobante seleccionado (base64 ZIP)
   */
  setSelectedComprobante(comprobante: string | null) {
    this.selectedComprobanteSubject.next(comprobante);
  }

  /**
   * Retorna el último comprobante emitido
   */
  getSelectedComprobante(): string | null {
    return this.selectedComprobanteSubject.value;
  }

  // Subject para almacenar y compartir el comprobante seleccionado
  // Observable que expone el comprobante seleccionado para otros componentes

  private infoComprobanteSubject =
    new BehaviorSubject<ConsultaCpeRequest | null>(null);
  infoComprobante$ = this.infoComprobanteSubject.asObservable();

  constructor() {}

  setInfoComprobante(registro: ConsultaCpeRequest): void {
    this.infoComprobanteSubject.next(registro);
  }

  getInfoComprobante(): ConsultaCpeRequest | null {
    return this.infoComprobanteSubject.getValue();
  }

  statusCdr(request: ConsultarCpeRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/status-cdr`, request);
  }

  controlCpeConsultaXml(
    token: string,
    request: ControlCpeConsultaXmlRequest
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<ConsultaCpeComprobanteResponse>(
      `${this.apiUrl}/controlcpe-consultaxml`,
      request,
      { headers }
    );
  }

  consultaCpeComprobante(
    request: ConsultaCpeRequest
  ): Observable<ConsultaCpeComprobanteResponse> {
    return this.http.post<ConsultaCpeComprobanteResponse>(
      `${this.apiUrl}/consultacpe-comprobante`,
      request
    );
  }

  consultaCpeUnificado(
    request: ConsultaCpeRequest
  ): Observable<ConsultaCpeUnificadoResponse> {
    return this.http.post<ConsultaCpeUnificadoResponse>(
      `${this.apiUrl}/consultacpe-unificado`,
      request
    );
  }
}
