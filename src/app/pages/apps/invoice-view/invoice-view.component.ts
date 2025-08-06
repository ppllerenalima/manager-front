import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';

// Servicios y utilidades
import { InvoiceService } from 'src/app/services/apps/invoice-view/invoice-view.service';
import { XmlParser } from 'src/app/shared/utils/XmlParser';
import { FileUtils } from 'src/app/shared/utils/FileUtils';
import { ZipUtils } from 'src/app/shared/utils/ZipUtils';

// Modelo de la factura
import { Invoice } from './Models/invoice';
import { ConsultaCpeArchivoRequest } from './Models/Requests/ConsultaCpeArchivoRequest';
import { distinctUntilChanged, filter, finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-invoice-view',
  templateUrl: './invoice-view.component.html',
  standalone: true, // Componente standalone
  imports: [
    MaterialModule,
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
  ],
})
export class InvoiceViewComponent implements OnInit, OnDestroy {
  // ----------------------------
  // 🔹 Signals - Estado reactivo
  // ----------------------------
  id = signal<number>(0); // Identificador de la factura
  invoice = signal<Invoice | null>(null); // Factura parseada
  contact = signal<any | null>(null); // Información de contacto (opcional)
  formData = signal<any | null>(null); // Datos de formulario adicionales

  // ----------------------------
  // 🔹 Estados de la interfaz
  // ----------------------------
  comprobante: any; // Comprobante en base64 ZIP
  error: string | null = null; // Manejo de errores
  isLoading = signal(false);
  displayedColumns: string[] = [
    'Description',
    'UnitPrice',
    'Quantity',
    'LineExtensionAmount',
  ];

  // ----------------------------
  // 🔹 Computed y dependencias
  // ----------------------------
  selectedStatus = computed(() => this.invoiceService.getSelectedComprobante());

  private destroy$ = new Subject<void>(); // Para liberar subscripciones
  invoiceService = inject(InvoiceService); // Inyección de servicio

  // ----------------------------
  // 🔹 Ciclo de vida
  // ----------------------------
  ngOnInit(): void {
    this.invoiceService.selectedComprobante$
      .pipe(takeUntil(this.destroy$))
      .subscribe((comprobanteBase64Zip) => {
        console.log('📥 Nuevo comprobante recibido');
        this.comprobante = comprobanteBase64Zip;
        this.procesarComprobante(comprobanteBase64Zip);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ----------------------------
  // 🔹 Métodos públicos
  // ----------------------------

  /** Calcula el subtotal sumando los montos de cada línea de factura */
  getSubtotal(): number {
    const inv = this.invoice();
    return inv
      ? inv.InvoiceLines.reduce(
        (acc, item) => acc + item.LineExtensionAmount,
        0
      )
      : 0;
  }

  /** Descarga el PDF y el ZIP del comprobante */
  descargarPdf(): void {
    console.log('Descargar XML desde base64 en JSON');

    this.isLoading.set(true);

    const infoComprobante = this.invoiceService.getInfoComprobante();
    if (!infoComprobante) {
      console.warn('⚠️ Faltan datos para continuar');
      return;
    }

    this.invoiceService.consultaCpeComprobante(infoComprobante)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: async (response) => {
          console.log('(comprobanteTipoZip) response', response);

          if (!response.esExito || !response.archivo) {
            console.error('❌ No se pudo obtener el archivo:', response.errores);
            return;
          }

          try {
            // Convertir base64 a Blob ZIP
            const byteCharacters = atob(response.archivo);
            const byteNumbers = Array.from(byteCharacters, (c) =>
              c.charCodeAt(0)
            );
            const byteArray = new Uint8Array(byteNumbers);
            const zipBlob = new Blob([byteArray], { type: 'application/zip' });

            // ✅ Descargar el archivo ZIP directamente
            this.descargarArchivo(zipBlob, 'comprobante.zip');

            // Extraer y descargar el PDF del ZIP
            const { pdfFileName, pdfBlob } = await ZipUtils.extractPdfFromBlob(
              zipBlob
            );
            this.descargarArchivo(pdfBlob, pdfFileName || 'archivo.pdf');
          } catch (error) {
            console.error('❌ Error al extraer el archivo ZIP:', error);
          }
        },
        error: (err) => {
          console.error('❌ Error al consultar el comprobante:', err);
        },
      });
  }

  // ----------------------------
  // 🔹 Métodos privados
  // ----------------------------

  /** Procesa el comprobante recibido en formato ZIP Base64 */
  private async procesarComprobante(comprobante: any): Promise<void> {
    try {
      // Descomprimir el ZIP Base64 y extraer el archivo XML y su contenido
      const { xmlFileName, xmlContent } =
        await ZipUtils.extractXmlFromBase64Zip(comprobante);

      // Descargar el XML al equipo del usuario (opcional)
      FileUtils.downloadFile(xmlContent, xmlFileName, 'application/xml');

      // Parsear el XML a un objeto Invoice y asignarlo al signal
      this.invoice.set(XmlParser.parseInvoiceXML(xmlContent));
      console.log('📄 Factura procesada correctamente:', this.invoice());
    } catch (error) {
      console.error('❌ Error al procesar el archivo ZIP:', error);
      this.error =
        'Error al procesar el comprobante. Verifica el formato del archivo.';
    }
  }

  /** Descarga un Blob como archivo */
  private descargarArchivo(blob: Blob, nombreArchivo: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    URL.revokeObjectURL(url);
  }
}
