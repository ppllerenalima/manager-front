import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  apiReports = environment.apiReports + '/Reports';
  http = inject(HttpClient);

  constructor() { }

  descargarExcel(perTributarioId: string) {


    this.http.get(`${this.apiReports}/comprobantes`, {
      params: { perTributarioId, format: 'EXCELOPENXML' },
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Comprobantes_${perTributarioId}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar Excel:', err);
        alert('Hubo un problema al generar el Excel.');
      },
    });
  }
}
