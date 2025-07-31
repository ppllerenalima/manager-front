import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgScrollbarModule } from 'ngx-scrollbar';
import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { GetTicketRequest } from 'src/app/core/models/get-ticket-request.model';
import { MaterialModule } from 'src/app/material.module';
import { SireService } from 'src/app/services/apps/customer/sire-list/sire-list.service';
import { Ticket2Service } from 'src/app/services/apps/ticket/ticket2.service';
import { TokenService } from 'src/app/services/apps/token/token.service';
import { registroSIRE } from '../customer/sire-list/listing/registroSIRE';
import { strFromU8, unzipSync } from 'fflate';
import { FileUtils } from 'src/app/shared/utils/FileUtils';
import { InvoiceService } from 'src/app/services/apps/invoice-view/invoice-view.service';
import { InvoiceViewComponent } from '../invoice-view/invoice-view.component';
import { ConsultaCpeRequest } from '../invoice-view/Models/Requests/ConsultaCpeRequest';

@Component({
  selector: 'app-compra-sire',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    TablerIconsModule,
    NgScrollbarModule,
    MatDividerModule,
    InvoiceViewComponent,
  ],
  templateUrl: './compra-sire.component.html',
  styleUrls: ['./compra-sire.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppCompraSireComponent implements OnInit {
  /** Propiedades básicas */
  clienteId: string;

  /** Estado de la UI */
  token: string | null = null;
  error = signal<string | null>(null);
  isLoading = signal(false);
  mensajeError = signal<string | null>(null);
  isActiveComprobante: boolean = false;

  /** Filtros */
  searchTerm = signal<string>('');
  selectedSerie = signal<string>('');
  selectedYear: number;
  selectedMonth: number;

  /** Datos obtenidos */
  registros = signal<registroSIRE[]>([]);
  selectedComprobante = signal<registroSIRE | null>(null);

  /** Responsive */
  private mediaMatcher: MediaQueryList = matchMedia(`(max-width: 1199px)`);

  /** Servicios */
  private tokenService = inject(TokenService);
  private ticketService = inject(Ticket2Service);
  private sireService = inject(SireService);
  private invoiceService = inject(InvoiceService);

  /** Años y meses para filtros */
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

  constructor(private route: ActivatedRoute) {}

  /** Inicializa el componente obteniendo el ID del cliente desde la ruta */
  ngOnInit(): void {
    this.clienteId = this.route.snapshot.paramMap.get('id')!;

    const currentYear = new Date().getFullYear();

    this.years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    this.selectedYear = currentYear;
    this.selectedMonth = new Date().getMonth() + 1;
    console.log('🆔 ID del cliente:', this.clienteId);
  }

  /** Determina si está en modo responsive (pantalla pequeña) */
  isOver(): boolean {
    return this.mediaMatcher.matches;
  }

  /** Busca las compras de SIRE usando los filtros seleccionados */
  onSearchCompras(): void {
    this.error.set(null);
    this.isLoading.set(true);

    const perTributario = `${this.selectedYear}${this.selectedMonth
      .toString()
      .padStart(2, '0')}`;
    console.log('📅 Período tributario:', perTributario);

    // Flujo reactivo: obtiene token, luego ticket, luego archivo, luego procesa el zip
    this.tokenService
      .getActiveToken(this.clienteId)
      .pipe(
        tap((token) => {
          console.log('🔑 Token obtenido');
          this.token = token;
        }),
        switchMap((token) => {
          const request: GetTicketRequest = {
            clienteId: this.clienteId,
            perTributario,
            accessToken: token,
          };
          return this.ticketService.getActiveTicket(request);
        }),
        tap((ticket) => console.log('🎫 Ticket obtenido:', ticket)),
        switchMap((ticket) => this.descargarArchivoReporte(ticket)),
        tap(({ blob }) => {
          console.log('📦 Archivo descargado');
          this.procesarArchivoZip(blob);
        }),
        catchError((err) => {
          console.error('❌ Error:', err);
          this.registros.set([]);
          this.error.set(this.obtenerMensajeError(err));
          return of(null);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();
  }

  /** Descarga el archivo reporte de SIRE usando el ticket obtenido */
  private descargarArchivoReporte(
    ticket: any
  ): Observable<{ blob: Blob; nombre: string }> {
    const request = {
      token: this.token!,
      nomArchivoReporte: ticket.nomArchivoReporte,
      codTipoArchivoReporte: ticket.codTipoAchivoReporte ?? '00',
      perTributario: ticket.perTributario,
      codProceso: ticket.codProceso,
      numTicket: ticket.numTicket,
    };

    return this.sireService
      .descargarArchivoReporte(request)
      .pipe(map((blob) => ({ blob, nombre: ticket.nomArchivoReporte })));
  }

  /** Procesa el ZIP descargado, busca el .txt y mapea a objetos registroSIRE */
  private procesarArchivoZip(blob: Blob): void {
    const reader = new FileReader();

    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const archivos = unzipSync(new Uint8Array(arrayBuffer));
      const txtFile = Object.keys(archivos).find((key) => key.endsWith('.txt'));

      if (!txtFile) {
        this.error.set('No se encontró un archivo .txt dentro del ZIP.');
        return;
      }

      const contenido = strFromU8(archivos[txtFile]);
      const lineas = contenido
        .split('\n')
        .filter((linea) => linea.trim() !== '');

      const registros = lineas.map(this.mapLineaARegistro);
      this.registros.set(registros);
    };

    reader.readAsArrayBuffer(blob);
  }

  /** Convierte una línea del TXT a un objeto registroSIRE */
  private mapLineaARegistro(linea: string): registroSIRE {
    const columnas = linea.split('|');
    return {
      ruc: columnas[0],
      fechaEmision: columnas[4],
      tipoComprobante: columnas[6],
      serie: columnas[7],
      numero: columnas[9],
      numeroDocIdentidad: columnas[12],
      nombreProveedor: columnas[13],
      total: FileUtils.parseToNumber(columnas[24]),
    };
  }

  /** Obtiene un mensaje de error amigable desde un error HTTP */
  private obtenerMensajeError(err: any): string {
    return (
      err?.error?.detalle || err.message || 'Error inesperado al obtener datos.'
    );
  }

  /** Computed: Filtra los registros por término de búsqueda y serie seleccionada */
  filteredRegistros = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const serie = this.selectedSerie();

    return this.registros().filter((r) => {
      const coincideBusqueda =
        r.nombreProveedor?.toLowerCase().includes(term) ||
        r.numero?.toLowerCase().includes(term) ||
        r.serie?.toLowerCase().includes(term);

      const coincideSerie = !serie || r.serie === serie;
      return coincideBusqueda && coincideSerie;
    });
  });

  /** Permite seleccionar un comprobante y consultar el detalle (descarga XML o ZIP) */
  selectComprobante(registro: registroSIRE): void {
    if (!this.token || !registro.numero) {
      this.mensajeError.set('⚠️ Token o número inválido.');
      this.selectedComprobante.set(null);
      return;
    }

    const numero = Number(registro.numero);
    if (isNaN(numero)) {
      this.mensajeError.set(`⚠️ El número no es válido: ${registro.numero}`);
      this.selectedComprobante.set(null);
      return;
    }

    const request: ConsultaCpeRequest = {
      rucEmisor: registro.numeroDocIdentidad ?? '',
      tipoComprobante: registro.tipoComprobante ?? '',
      serie: registro.serie ?? '',
      numero,
    };

    console.log('📤 Consultando comprobante:', request);
    this.isLoading.set(true);

    this.invoiceService
      .consultaCpeUnificado(this.token, request)
      .pipe(
        tap((resp) => {
          if (!resp) return;

          console.log('📥 Respuesta unificada:', resp);

          if (!resp.esExito) {
            // Unificamos el mensaje de error
            const primerError = resp.errores?.[0];
            const mensaje = primerError
              ? `${primerError.status} - ${primerError.message}`
              : '📄 Error desconocido al obtener el comprobante.';

            this.mensajeError.set(mensaje);
            this.selectedComprobante.set(null);
            return;
          }

          // ✅ Si fue exitoso
          this.mensajeError.set(null);
          this.selectedComprobante.set(registro); // el registro que ya tienes seleccionado

          // Guardar archivo en el servicio si quieres usarlo luego
          if (resp.archivo) {
            this.invoiceService.setSelectedComprobante(resp.archivo);
          }

          // Guardamos info adicional en el servicio
          this.invoiceService.setToken(this.token!);
          this.invoiceService.setInfoComprobante({
            rucEmisor: request.rucEmisor,
            tipoComprobante: request.tipoComprobante,
            serie: request.serie,
            numero: request.numero,
            tipo: '01',
          });

          // // 🔹 Si quieres descargar automáticamente el archivo
          // if (resp.archivo && resp.nombreArchivo) {
          //   this.descargarArchivo(resp.archivo, resp.nombreArchivo);
          // }
        }),
        catchError((err) => {
          console.error('❌ Error comprobante:', err);
          this.mensajeError.set('Error al consultar el comprobante.');
          this.selectedComprobante.set(null);
          return of(null);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();

    // this.invoiceService
    //   .controlCpeConsultaXml(this.token, request)
    //   .pipe(
    //     tap((resp) => {
    //       if (!resp) return;

    //       console.log('📥 Respuesta comprobante:', resp);

    //       if (!resp.esExito) {
    //         let mensaje = '📄 Error desconocido al obtener el comprobante.';
    //         try {
    //           const errorInterno = JSON.parse(resp.errores?.[0]?.msg ?? '{}');
    //           mensaje = errorInterno.errors?.[0]?.desError ?? mensaje;
    //         } catch (e) {
    //           console.error('❌ Error parseando error interno:', e);
    //         }
    //         this.mensajeError.set(mensaje);
    //         this.selectedComprobante.set(null);
    //         return;
    //       }

    //       this.mensajeError.set(null);
    //       this.selectedComprobante.set(registro);
    //       this.invoiceService.setSelectedComprobante(resp.archivo);

    //       this.invoiceService.setToken(this.token!);
    //       this.invoiceService.setInfoComprobante({
    //         rucEmisor: request.rucEmisor,
    //         tipoComprobante: request.tipoComprobante,
    //         serie: request.serie,
    //         numero: request.numero,
    //         tipo: '01',
    //       });
    //     }),
    //     catchError((err) => {
    //       console.error('❌ Error comprobante:', err);
    //       this.mensajeError.set('Error al consultar el comprobante.');
    //       this.selectedComprobante.set(null);
    //       return of(null);
    //     }),
    //     finalize(() => this.isLoading.set(false))
    //   )
    //   .subscribe();
  }
}
