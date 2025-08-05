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
import { ArchivoReporteRequest } from './Models/Requests/ArchivoReporteRequest';

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

  constructor(private route: ActivatedRoute) { }

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
    // 1️⃣ Reiniciar estados
    this.error.set(null);
    this.registros.set([]);
    this.selectedComprobante.set(null);
    this.isLoading.set(true);

    const perTributario = `${this.selectedYear}${this.selectedMonth
      .toString()
      .padStart(2, '0')}`;
    console.log('📅 Período tributario:', perTributario);

    const request: ArchivoReporteRequest = {
      clienteId: this.clienteId,
      perTributario: perTributario,
    };

    this.sireService.descargarArchivoReporte(request)
      .pipe(finalize(() => this.isLoading.set(false))) // 2️⃣ Quita loading al terminar
      .subscribe({
        next: (blob: Blob) => {
          // 3️⃣ Procesar ZIP si todo sale bien
          this.procesarArchivoZip(blob);
        },
        error: (err) => {
          // 4️⃣ Manejar errores reales del backend
          this.manejarErrorDescarga(err);
        }
      });
  }

  /** Procesa el ZIP descargado, mapeando líneas a registros */
  private procesarArchivoZip(blob: Blob): void {
    const reader = new FileReader();

    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const archivos = unzipSync(new Uint8Array(arrayBuffer));

      const txtFile = Object.keys(archivos).find((key) => key.endsWith('.txt'));
      if (!txtFile) {
        this.error.set('El ZIP no contiene un archivo .txt válido.');
        return;
      }

      const contenido = strFromU8(archivos[txtFile]);
      const registros = contenido
        .split('\n')
        .map(linea => linea.trim())
        .filter(linea => linea !== '')
        .slice(1) // 🔹 Ignora la primera fila (encabezados)
        .map(this.mapLineaARegistro);

      if (registros.length === 0) {
        this.error.set('El archivo no contiene registros válidos.');
        return;
      }

      this.registros.set(registros);
    };

    reader.onerror = () => {
      this.error.set('Error al leer el archivo ZIP.');
    };

    reader.readAsArrayBuffer(blob);
  }

  /** Muestra mensaje de error real desde backend si existe */
  private async manejarErrorDescarga(err: any): Promise<void> {
    console.error('Error al descargar archivo:', err);

    let mensaje = 'Ocurrió un error inesperado al descargar el archivo.';

    try {
      // 1️⃣ Blob (texto plano)
      if (err.error instanceof Blob) {
        mensaje = await err.error.text();
      }
      // 2️⃣ JSON con message
      else if (err.error?.message) {
        mensaje = err.error.message;
      }
      // 3️⃣ Texto plano
      else if (typeof err.error === 'string') {
        mensaje = err.error;
      }
    } catch (e) {
      console.warn('No se pudo parsear el error, usando mensaje genérico.');
    }

    this.error.set(
      mensaje || 'El archivo no está disponible todavía o ocurrió un error.'
    );
    this.registros.set([]); // 🔹 Limpia registros si hay error
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
    this.selectedComprobante.set(null); // el registro que ya tienes seleccionado
    this.invoiceService.setSelectedComprobante(null);

    const numero = Number(registro.numero);
    if (isNaN(numero)) {
      this.mensajeError.set(`⚠️ El número no es válido: ${registro.numero}`);
      this.selectedComprobante.set(null);
      return;
    }

    const request: ConsultaCpeRequest = {
      clienteId: this.clienteId,

      rucEmisor: registro.numeroDocIdentidad ?? '',
      tipoComprobante: registro.tipoComprobante ?? '',
      serie: registro.serie ?? '',
      numero,
    };

    console.log('📤 Consultando comprobante:', request);
    this.isLoading.set(true);

    this.invoiceService
      .consultaCpeUnificado(
        request)
      .pipe(
        tap((resp) => {
          if (!resp) return;

          console.log('📥 Respuesta unificada:', resp);

          if (!resp.esExito) {
            // Filtrar solo errores que tengan mensaje
            const mensajesErrores = resp.errores
              ?.filter(e => e && e.message)             // Ignoramos objetos vacíos
              .map(e => `${e.status ?? 'Error'} - ${e.message}`); // Formateamos

            // Unir todos los mensajes en uno solo o usar mensaje genérico
            const mensajeFinal = mensajesErrores?.length
              ? mensajesErrores.join(' | ')
              : '📄 Error desconocido al obtener el comprobante.';

            this.mensajeError.set(mensajeFinal);
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
          this.invoiceService.setInfoComprobante({
            rucEmisor: request.rucEmisor,
            tipoComprobante: request.tipoComprobante,
            serie: request.serie,
            numero: request.numero,
            tipo: '01',
          });
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
  }
}
