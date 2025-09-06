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
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { filter, finalize, Subject, takeUntil } from 'rxjs';
import { MaterialModule } from 'src/app/material.module';
import { SireService } from 'src/app/services/apps/customer/sire-list/sire-list.service';
import { registroSIRE } from '../customer/sire-list/listing/registroSIRE';
import { strFromU8, unzipSync } from 'fflate';
import { FileUtils } from 'src/app/shared/utils/FileUtils';
import { InvoiceService } from 'src/app/services/apps/invoice-view/invoice-view.service';
import { InvoiceViewComponent } from '../invoice-view/invoice-view.component';
import { ConsultaCpeRequest } from '../invoice-view/Models/Requests/ConsultaCpeRequest';
import { ArchivoReporteRequest } from './Models/Requests/ArchivoReporteRequest';
import { ClienteService } from 'src/app/services/apps/cliente/cliente.service';

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
    RouterModule,
  ],
  templateUrl: './compra-sire.component.html',
  styleUrls: ['./compra-sire.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppCompraSireComponent implements OnInit {
  /** ================================
   * 📌 1. PROPIEDADES BÁSICAS
   * ================================ */
  clienteId: string;
  token: string | null = null;

  // Signals para las propiedades
  ruc = signal<string>('');
  razonSocial = signal<string>('');
  direccion = signal<string>('');

  /** Estado de la UI */
  error = signal<string | null>(null);
  mensajeError = signal<string | null>(null);
  isLoading = signal(false);
  isActiveComprobante = false;

  /** Control de suscripciones */
  private destroy$ = new Subject<void>();

  /** ================================
   * 📌 2. FILTROS
   * ================================ */
  searchTerm = signal<string>('');
  selectedSerie = signal<string>('');
  selectedYear: number;
  selectedMonth: number;

  /** ================================
   * 📌 3. DATOS OBTENIDOS
   * ================================ */
  registros = signal<registroSIRE[]>([]);
  selectedComprobante = signal<registroSIRE | null>(null);

  /** ================================
   * 📌 4. RESPONSIVE
   * ================================ */
  private mediaMatcher: MediaQueryList = matchMedia(`(max-width: 1199px)`);

  /** ================================
   * 📌 5. SERVICIOS
   * ================================ */
  sireService = inject(SireService);
  invoiceService = inject(InvoiceService);
  clienteService = inject(ClienteService);

  /** ================================
   * 📌 6. DATOS DE APOYO
   * ================================ */
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

  /** ================================
   * 📌 7. INICIALIZACIÓN
   * ================================ */
  ngOnInit(): void {
    // Obtiene ID de cliente desde la URL
    this.clienteId = this.route.snapshot.paramMap.get('id')!;
    console.log('🆔 ID del cliente:', this.clienteId);

    this.getCliente();

    // Inicializa años y mes actual
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    this.selectedYear = currentYear;
    this.selectedMonth = new Date().getMonth() + 1;

    // 🔹 Suscribirse a comprobantes emitidos por InvoiceService
    this.invoiceService.selectedComprobante$
      .pipe(
        takeUntil(this.destroy$),
        filter((val): val is string => !!val) // ignora null o undefined
      )
      .subscribe((comprobanteBase64Zip) => {
        console.log('📦 Comprobante recibido');
        this.procesarComprobante(comprobanteBase64Zip);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** ================================
   * 📌 8. RESPONSIVE
   * ================================ */
  isOver(): boolean {
    return this.mediaMatcher.matches;
  }

  /** ================================
   * 📌 9. BÚSQUEDA DE COMPRAS
   * ================================ */
  onSearchCompras(): void {
    // Reinicia estados
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
      perTributario,
    };

    this.sireService
      .descargarArchivoReporte(request)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (blob: Blob) => this.procesarArchivoZip(blob),
        error: (err) => this.manejarErrorDescarga(err),
      });
  }

  /** Procesa el ZIP descargado y llena registros */
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
        .map((linea) => linea.trim())
        .filter((linea) => linea !== '')
        .slice(1) // Ignora encabezados
        .map(this.mapLineaARegistro);

      if (registros.length === 0) {
        this.error.set('El archivo no contiene registros válidos.');
        return;
      }

      this.registros.set(registros);
    };

    reader.onerror = () => this.error.set('Error al leer el archivo ZIP.');
    reader.readAsArrayBuffer(blob);
  }

  /** Maneja errores de descarga */
  private async manejarErrorDescarga(err: any): Promise<void> {
    console.error('Error al descargar archivo:', err);
    let mensaje = 'Ocurrió un error inesperado al descargar el archivo.';

    try {
      if (err.error instanceof Blob) {
        mensaje = await err.error.text();
      } else if (err.error?.message) {
        mensaje = err.error.message;
      } else if (typeof err.error === 'string') {
        mensaje = err.error;
      }
    } catch {
      console.warn('No se pudo parsear el error, usando mensaje genérico.');
    }

    this.error.set(
      mensaje || 'El archivo no está disponible todavía o ocurrió un error.'
    );
    this.registros.set([]);
  }

  /** Convierte una línea del TXT a un registro */
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

  /** Filtra registros según búsqueda y serie */
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

  /** Selecciona un comprobante y lo consulta */
  selectComprobante(registro: registroSIRE): void {
    this.selectedComprobante.set(null);
    this.invoiceService.setSelectedComprobante(null);

    const numero = Number(registro.numero);
    if (isNaN(numero)) {
      this.mensajeError.set(`⚠️ El número no es válido: ${registro.numero}`);
      return;
    }

    const request: ConsultaCpeRequest = {
      clienteId: this.clienteId,
      rucEmisor: registro.numeroDocIdentidad ?? '',
      tipoComprobante: registro.tipoComprobante ?? '',
      serie: registro.serie ?? '',
      numero,
      tipo: '01',
    };

    console.log('📤 Consultando comprobante:', request);
    this.isLoading.set(true);

    this.invoiceService
      .consultaCpeUnificado(request)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (resp) => {
          if (!resp?.esExito) {
            const mensajesErrores = resp?.errores
              ?.filter((e) => e && e.message)
              .map((e) => `${e.status ?? 'Error'} - ${e.message}`)
              .join('\n');
            this.mensajeError.set(mensajesErrores || 'Error desconocido.');
            return;
          }

          // Si es exitoso, setear comprobante seleccionado
          this.selectedComprobante.set(registro);
          this.invoiceService.setSelectedComprobante(resp?.archivo || null);
          this.invoiceService.setInfoComprobante(request);
        },
        error: (err) => {
          console.error('❌ Error al consultar CPE:', err);
          this.mensajeError.set('Error al consultar el comprobante.');
        },
      });
  }

  /** Procesa el comprobante recibido en base64 desde InvoiceService */
  private procesarComprobante(base64Zip: string): void {
    console.log('📦 Procesando comprobante base64...');
    // Aquí puedes implementar lógica para descomprimir el ZIP, mostrar detalle, etc.
  }

  getCliente(): void {
    this.clienteService.getById(this.clienteId).subscribe({
      next: (data) => {
        this.ruc.set(data.ruc);
        this.razonSocial.set(data.razonsocial);
        this.direccion.set(data.direccion);

        // this.cliente = data;
        console.log('Cliente cargado:', data);
      },
      error: (err) => {
        console.error('Error al obtener cliente:', err);
      },
    });
  }
}
