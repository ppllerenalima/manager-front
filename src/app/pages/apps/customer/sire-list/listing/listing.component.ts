import { Component, computed, Input, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { SireService } from 'src/app/services/apps/customer/sire-list/sire-list.service';
import { strFromU8, unzipSync } from 'fflate';
import { registroSIRE } from './registroSIRE';
import { FileUtils } from 'src/app/shared/utils/FileUtils';
import { AppSireInvoiceViewComponent } from '../invoice-view/invoice-view.component';
import { InvoiceService } from 'src/app/services/apps/invoice-view/invoice-view.service';
import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { TokenService } from 'src/app/services/apps/token/token.service';
import { GetTicketRequest } from 'src/app/core/models/get-ticket-request.model';
import { Ticket2Service } from 'src/app/services/apps/ticket/ticket2.service';

@Component({
  selector: 'app-listing',
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    TablerIconsModule,
    NgScrollbarModule,
    MatDividerModule,
    AppSireInvoiceViewComponent,
  ],
  templateUrl: './listing.component.html',
})
export class AppListingComponent implements OnInit {
  @Input() clienteId!: string;
  @Input() username!: string;
  @Input() password!: string;

  token: string | null = null;
  error = signal<string | null>(null);
  isLoading = signal(false);

  private mediaMatcher: MediaQueryList = matchMedia(`(max-width: 1199px)`);

  mensajeError = signal<string | null>(null);
  registros = signal<registroSIRE[]>([]);
  searchTerm = signal<string>('');
  selectedSerie = signal<string>(''); // puedes tener más filtros si deseas

  years: number[] = [];
  months = [
    { value: 1, name: 'Enero' },
    { value: 2, name: 'Febrero' },
    { value: 3, name: 'Marzo' },
    { value: 4, name: 'Abril' },
    { value: 5, name: 'Mayo' },
    { value: 6, name: 'Junio' },
    { value: 7, name: 'Julio' },
    { value: 8, name: 'Agosto' },
    { value: 9, name: 'Septiembre' },
    { value: 10, name: 'Octubre' },
    { value: 11, name: 'Noviembre' },
    { value: 12, name: 'Diciembre' },
  ];

  selectedYear: number;
  selectedMonth: number;

  selectedComprobante = signal<registroSIRE | null>(null);
  isActiveComprobante: boolean = false;

  constructor(
    private sireService: SireService,
    private invoiceService: InvoiceService,
    private tokenService: TokenService,
    private ticketService: Ticket2Service
  ) {}

  isOver(): boolean {
    return this.mediaMatcher.matches;
  }

  ngOnInit() {
    const currentYear = new Date().getFullYear();

    this.years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    this.selectedYear = currentYear;
    this.selectedMonth = new Date().getMonth() + 1;
  }

  // onSearchCompras(): void {
  //   this.token = null;
  //   this.error.set(null);
  //   this.isLoading.set(true);

  //   const perTributario = `${this.selectedYear}${this.selectedMonth
  //     .toString()
  //     .padStart(2, '0')}`;

  //   this.tokenService
  //     .getActiveToken(this.clienteId)
  //     .pipe(
  //       tap((resp) => {
  //         console.log('✅ Token obtenido');
  //         this.token = resp;

  //         const request: GetTicketRequest = {
  //           clienteId: this.clienteId,
  //           perTributario: perTributario,
  //           accessToken: this.token,
  //         };

  //         this.ticketService.getActiveTicket(request).subscribe({
  //           next: (response) => console.log('✅ Ticket:', response),
  //           error: (err) => console.error('❌ Error:', err),
  //         });
  //       }),
  //       switchMap((registro) => this.descargarArchivoReporte(registro)),
  //       tap(({ blob, nombre }) => {
  //         console.log('✅ Archivo descargado');
  //         this.descargarArchivo(blob, nombre);
  //         this.procesarArchivoZip(blob);
  //       }),
  //       catchError((err) => {
  //         this.registros.set([]);
  //         this.error.set(this.obtenerMensajeError(err));
  //         return of(null);
  //       }),
  //       finalize(() => this.isLoading.set(false))
  //     )
  //     .subscribe();
  // }

  onSearchCompras(): void {
    this.token = null;
    this.error.set(null);
    this.isLoading.set(true);

    const perTributario = `${this.selectedYear}${this.selectedMonth
      .toString()
      .padStart(2, '0')}`;

    console.log('perTributario', perTributario);

    // this.tokenService
    //   .getActiveToken(this.clienteId)
    //   .pipe(
    //     tap((token) => {
    //       console.log('✅ Token obtenido');
    //       this.token = token;
    //     }),
    //     switchMap((token) => {
    //       const request: GetTicketRequest = {
    //         clienteId: this.clienteId,
    //         perTributario,
    //         accessToken: token,
    //       };
    //       return this.ticketService.getActiveTicket(request);
    //     }),
    //     tap((ticket) => {
    //       console.log('✅ Ticket obtenido:', ticket);
    //     }),
    //     switchMap((ticket) => this.descargarArchivoReporte(ticket)),
    //     tap(({ blob, nombre }) => {
    //       console.log('✅ Archivo descargado');
    //       // this.descargarArchivo(blob, nombre);
    //       this.procesarArchivoZip(blob);
    //     }),
    //     catchError((err) => {
    //       console.error('❌ Error:', err);
    //       this.registros.set([]);
    //       this.error.set(this.obtenerMensajeError(err));
    //       return of(null);
    //     }),
    //     finalize(() => this.isLoading.set(false))
    //   )
    //   .subscribe();
  }

  // private descargarArchivoReporte(
  //   ticket: any
  // ): Observable<{ blob: Blob; nombre: string }> {
  //   const request = {
  //     token: this.token!,
  //     nomArchivoReporte: ticket.nomArchivoReporte,
  //     codTipoArchivoReporte: ticket.codTipoAchivoReporte ?? '00',
  //     perTributario: ticket.perTributario,
  //     codProceso: ticket.codProceso,
  //     numTicket: ticket.numTicket,
  //   };

  //   return this.sireService
  //     .descargarArchivoReporte(request)
  //     .pipe(map((blob) => ({ blob, nombre: ticket.nomArchivoReporte })));
  // }

  private obtenerMensajeError(err: any): string {
    return err?.error?.detalle || err.message || 'Error inesperado';
  }

  private procesarArchivoZip(blob: Blob): void {
    const reader = new FileReader();

    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      const archivos = unzipSync(uint8Array);
      const nombreArchivoTxt = Object.keys(archivos).find((key) =>
        key.endsWith('.txt')
      );

      if (!nombreArchivoTxt) {
        this.error.set('No se encontró un archivo .txt dentro del ZIP.');
        return;
      }

      const contenido = strFromU8(archivos[nombreArchivoTxt]);
      const lineas = contenido
        .split('\n')
        .filter((linea) => linea.trim() !== '');

      const registros: registroSIRE[] = lineas.map((linea) => {
        const columnas = linea.split('|');
        return {
          ruc: columnas[0],
          // razonSocial: columnas[1],
          // periodo: columnas[2],
          // carSunat: columnas[3],
          fechaEmision: columnas[4],
          // fechaVencimiento: columnas[5],
          tipoComprobante: columnas[6],
          serie: columnas[7],
          // anio: columnas[8],
          numero: columnas[9],
          // numeroFinalRango: columnas[10],
          // tipoDocIdentidad: columnas[11],
          numeroDocIdentidad: columnas[12],
          nombreProveedor: columnas[13],
          // biGravadoDG: FileUtils.parseToNumber(columnas[14]),
          // igvDG: FileUtils.parseToNumber(columnas[15]),
          // biGravadoDGNG: FileUtils.parseToNumber(columnas[16]),
          // igvDGNG: FileUtils.parseToNumber(columnas[17]),
          // biGravadoDNG: FileUtils.parseToNumber(columnas[18]),
          // igvDNG: FileUtils.parseToNumber(columnas[19]),
          // valorAdqNG: FileUtils.parseToNumber(columnas[20]),
          // isc: FileUtils.parseToNumber(columnas[21]),
          // icbper: FileUtils.parseToNumber(columnas[22]),
          // otrosTributos: FileUtils.parseToNumber(columnas[23]),
          total: FileUtils.parseToNumber(columnas[24]),
          // moneda: columnas[25],
          // tipoCambio: FileUtils.parseToNumber(columnas[26]),
          // fechaEmisionMod: columnas[27],
          // tipoCPMod: columnas[28],
          // serieCPMod: columnas[29],
          // codDam: columnas[30],
          // numeroCPMod: columnas[31],
          // clasificacion: columnas[32],
          // idProyecto: columnas[33],
          // porcPart: FileUtils.parseToNumber(columnas[34]),
          // imb: FileUtils.parseToNumber(columnas[35]),
          // carOrigen: columnas[36],
          // detraccion: columnas[37],
          // tipoNota: columnas[38],
          // estadoComprobante: columnas[39],
          // incal: columnas[40],
          // clus: columnas.slice(41, 80), // CLU1 to CLU39
          // lineaOriginal: linea // si quieres tener acceso al texto crudo
        };
      });

      this.registros.set(registros); // Se actualiza la señal
    };

    reader.readAsArrayBuffer(blob);
  }

  private descargarArchivo(blobData: any, nombreArchivo: string): void {
    const blob = new Blob([blobData], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Computed: registros filtrados y buscados
  filteredRegistros = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const serie = this.selectedSerie();

    return this.registros().filter((r) => {
      const matchTerm =
        r.nombreProveedor!.toLowerCase().includes(term) ||
        r.numero!.toLowerCase().includes(term) ||
        r.serie!.toLowerCase().includes(term);

      const matchSerie = !serie || r.serie === serie;

      return matchTerm && matchSerie;
    });
  });

  selectComprobante(registro: registroSIRE): void {
    if (!this.token || !registro.numero) {
      const mensaje = '⚠️ Token o número inválido.';
      console.error(mensaje);
      this.mensajeError.set(mensaje);
      this.selectedComprobante.set(null);
      return;
    }

    const numero = Number(registro.numero);
    if (isNaN(numero)) {
      const mensaje = `⚠️ El número del comprobante no es válido: ${registro.numero}`;
      console.error(mensaje);
      this.mensajeError.set(mensaje);
      this.selectedComprobante.set(null);
      return;
    }

    const request = {
      rucEmisor: registro.numeroDocIdentidad ?? '',
      tipoComprobante: registro.tipoComprobante ?? '',
      serie: registro.serie ?? '',
      numero,
    };

    console.log('📦 Enviando request:', request);
    this.isLoading.set(true);

    this.invoiceService.controlCpeConsultaXml(this.token, request).subscribe({
      next: (resp) => {
        this.isLoading.set(false);

        console.log('resp', resp);

        if (!resp.esExito) {
          let mensaje = '📄 Error desconocido';

          try {
            const errorInterno = JSON.parse(resp.errores?.[0]?.msg ?? '{}');
            mensaje = errorInterno.errors?.[0]?.desError ?? mensaje;
          } catch (e) {
            console.error('❌ Error parseando mensaje de error:', e);
          }

          console.error('📄 Error en la respuesta:', mensaje);
          this.mensajeError.set(mensaje);
          this.selectedComprobante.set(null);
          return;
        }

        this.mensajeError.set(null);
        this.selectedComprobante.set(registro);
        this.invoiceService.setSelectedComprobante(resp.archivo);
      },
      error: (err) => {
        const mensaje = '❌ Error consultando el CPE.';
        console.error(mensaje, err);
        this.isLoading.set(false);
        this.mensajeError.set(mensaje);
        this.selectedComprobante.set(null);
      },
    });
  }
}
