import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// descargar-zip-request.model.ts
export interface DescargarZipRequest {
  rucEmisor: string;
  tipoComprobante: string;
  serie: string;
  numero: number;
  tipo: string; // 01=PDF, 02=XML, etc.
}

// descargar-zip-response.model.ts
export interface DescargarZipResponse {
  esExito: boolean;
  statusCode: number;
  archivo: string;       // base64
  nombreArchivo: string;
  errores: { status: string; message: string }[];
}


@Injectable({
  providedIn: 'root'
})
export class CpeService {
  apiUrl = environment.apiManager + '/Cpe';
  http = inject(HttpClient);

  constructor() { }

  descargarPdf(request: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/DescargarZip`, request, {
      responseType: 'blob'  // 👈 clave: recibir como Blob (PDF binario)
    });
  }


}
