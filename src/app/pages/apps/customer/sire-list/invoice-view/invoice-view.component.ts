import { Component, computed, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';
import { InvoiceService } from 'src/app/services/apps/invoice-view/invoice-view.service';
import { XmlParser } from 'src/app/shared/utils/XmlParser';
import JSZip from 'jszip';
import { FileUtils } from 'src/app/shared/utils/FileUtils';
import { ZipUtils } from 'src/app/shared/utils/ZipUtils';
import { Invoice, InvoiceLine } from '../invoice';

@Component({
  selector: 'app-invoice-view',
  templateUrl: './invoice-view.component.html',
  imports: [
    MaterialModule,
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
  ],
})
export class AppSireInvoiceViewComponent implements OnInit {
  id = signal<number>(0);
  invoice = signal<Invoice | null>(null);
  contact = signal<any | null>(null);
  formData = signal<any | null>(null);
  comprobante: any;

  error: string | null = null;
  isLoading = false;

  displayedColumns: string[] = [
    'Description',
    'UnitPrice',
    'Quantity',
    'LineExtensionAmount',
  ];

  selectedStatus = computed(() => this.invoiceService.getSelectedComprobante());

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit(): void {
    this.invoiceService.selectedComprobante$.subscribe((comprobante) => {
      this.comprobante = comprobante;
      this.procesarComprobante(comprobante);
    });
  }

  async procesarComprobante(comprobante: any) {
    // lógica para cargar o mostrar el comprobante
    // console.log(this.comprobante.rucEmisor); // ⚠️ this.comprobante no está definido, probablemente quisiste poner 'comprobante'

    // const request = {
    //   token: comprobante.token,
    //   rucEmisor: comprobante.rucEmisor,
    //   tipoComprobante: comprobante.tipoComprobante,
    //   serie: comprobante.serie,
    //   numero: comprobante.numero
    // };

    // this.invoiceService.comprobanteZip(request).subscribe({
    //   next: async (resp) => {
    //     console.log('✅ Consulta CPE:', resp);

    try {
      const base64Zip = comprobante;
      const { xmlFileName, xmlContent } =
        await ZipUtils.extractXmlFromBase64Zip(base64Zip);

      FileUtils.downloadFile(xmlContent, xmlFileName, 'application/xml');

      this.invoice.set(XmlParser.parseInvoiceXML(xmlContent));

      console.log('📄 Factura procesada:', this.invoice());
    } catch (error) {
      console.error('❌ Error procesando archivo ZIP:', error);
    }

    //     this.isLoading = false;
    //   },
    //   error: (err) => {
    //     this.error = 'Error consultando el estado del CPE';
    //     console.error(err);
    //     this.isLoading = false;
    //   }
    // });
    // Código comentado para procesar el ZIP
  }

  getSubtotal(): number {
    const inv = this.invoice();
    if (!inv) return 0;
    return inv.InvoiceLines.reduce(
      (acc, item) => acc + item.LineExtensionAmount,
      0
    );
  }
}
