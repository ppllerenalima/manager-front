import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
export class InvoiceViewComponent implements OnInit {
  // Signals para gestionar estados reactivos
  id = signal<number>(0); // Identificador de la factura (por si se requiere)
  invoice = signal<Invoice | null>(null); // Factura parseada
  contact = signal<any | null>(null); // Información de contacto (si se requiere)
  formData = signal<any | null>(null); // Datos de formulario adicionales (si se requiere)

  // Comprobante seleccionado (base64 ZIP recibido)
  comprobante: any;

  // Estados de la interfaz
  error: string | null = null; // Manejo de errores
  isLoading = false; // Indicador de carga

  // Columnas que se mostrarán en la tabla de detalle de factura
  displayedColumns: string[] = [
    'Description',
    'UnitPrice',
    'Quantity',
    'LineExtensionAmount',
  ];

  // Computed para obtener el comprobante seleccionado desde el servicio
  selectedStatus = computed(() => this.invoiceService.getSelectedComprobante());

  // Inyección del servicio InvoiceService
  invoiceService = inject(InvoiceService);

  constructor() { }

  ngOnInit(): void {
    // Nos suscribimos al observable del servicio para recibir el comprobante seleccionado
    this.invoiceService.selectedComprobante$.subscribe(
      (comprobanteBase64Zip) => {
        console.log('comprobanteBase64Zip')

        this.comprobante = comprobanteBase64Zip;
        this.procesarComprobante(comprobanteBase64Zip);
      }
    );
  }

  /**
   * Procesa el comprobante recibido en formato ZIP Base64.
   * Extrae el XML, lo descarga al usuario y lo parsea como objeto Invoice.
   * @param comprobante Base64 ZIP del comprobante seleccionado
   */
  async procesarComprobante(comprobante: any): Promise<void> {
    try {
      // Descomprimir el ZIP Base64 y extraer el archivo XML y su contenido
      const { xmlFileName, xmlContent } =
        await ZipUtils.extractXmlFromBase64Zip(comprobante);

      // Opcional: Descargar el XML al equipo del usuario
      FileUtils.downloadFile(xmlContent, xmlFileName, 'application/xml');

      // Parsear el XML a un objeto Invoice y asignarlo al signal
      this.invoice.set(XmlParser.parseInvoiceXML(xmlContent));

      console.log('📄 Factura procesada correctamente:', this.invoice());
    } catch (error) {
      // Manejo de errores al procesar el ZIP
      console.error('❌ Error al procesar el archivo ZIP:', error);
      this.error =
        'Error al procesar el comprobante. Verifica el formato del archivo.';
    }
  }

  /**
   * Calcula el subtotal sumando los montos de cada línea de factura.
   * @returns Total de los LineExtensionAmount de las líneas de la factura.
   */
  getSubtotal(): number {
    const inv = this.invoice();
    if (!inv) return 0;

    // Sumar los subtotales de cada línea de la factura
    return inv.InvoiceLines.reduce(
      (acc, item) => acc + item.LineExtensionAmount,
      0
    );
  }

  descargarPdf() {
    console.log('Descargar XML desde base64 en JSON');

    const infoComprobante = this.invoiceService.getInfoComprobante();

    if (!infoComprobante) {
      console.warn('Faltan datos para continuar');
      return;
    }

    this.invoiceService
      .consultaCpeComprobante(infoComprobante)
      .subscribe({
        next: async (response) => {
          console.log('(comprobanteTipoZip) response', response);

          if (!response.esExito || !response.valArchivo) {
            console.error('No se pudo obtener el archivo:', response.errores);
            return;
          }

          try {
            // Convertir base64 a Blob ZIP
            const byteCharacters = atob(response.valArchivo);
            const byteNumbers = new Array(byteCharacters.length)
              .fill(0)
              .map((_, i) => byteCharacters.charCodeAt(i));
            const byteArray = new Uint8Array(byteNumbers);
            const zipBlob = new Blob([byteArray], { type: 'application/zip' });

            // ✅ Descargar el archivo ZIP directamente
            const zipUrl = URL.createObjectURL(zipBlob);
            const zipLink = document.createElement('a');
            zipLink.href = zipUrl;
            zipLink.download = 'comprobante.zip';
            zipLink.click();
            URL.revokeObjectURL(zipUrl);

            // Extraer el PDF del ZIP
            const { pdfFileName, pdfBlob } = await ZipUtils.extractPdfFromBlob(
              zipBlob
            );

            // Descargar el PDF
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const pdfLink = document.createElement('a');
            pdfLink.href = pdfUrl;
            pdfLink.download = pdfFileName || 'archivo.pdf';
            pdfLink.click();
            URL.revokeObjectURL(pdfUrl);
          } catch (error) {
            console.error('Error al extraer el XML:', error);
          }
        },
        error: (err) => {
          console.error('Error al consultar el comprobante:', err);
        },
      });
  }
}
