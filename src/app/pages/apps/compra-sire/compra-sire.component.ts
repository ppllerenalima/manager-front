import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  ViewChild,
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
import { ConsultaCpeRequest } from '../invoice-view/Models/Requests/ConsultaCpeRequest';
import { GetPerTributarioRequest } from './Models/Requests/GetPerTributarioRequest';
import { ClienteService } from 'src/app/services/apps/cliente/cliente.service';
import { MatCardModule } from '@angular/material/card';
import { PerTributarioResponse } from './Models/Responses/PerTributarioResponse';
import { MatTableDataSource } from '@angular/material/table';
import { ComprobantePaginatedResponse } from './Models/Responses/ComprobantePaginatedResponse';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ComprobanteService } from 'src/app/services/apps/compra-sire/comprobante.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PerTributarioService } from 'src/app/services/apps/compra-sire/pertributario.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

// snippets
import { EXPAND_TABLE_HTML_SNIPPET } from '../../tables/expand-table/code/expand-table-html-snippet';
import { EXPAND_TABLE_TS_SNIPPET } from '../../tables/expand-table/code/expand-table-ts-snippet';

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
    RouterModule,

    MatCardModule,
  ],
  templateUrl: './compra-sire.component.html',
  styleUrls: ['./compra-sire.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class AppCompraSireComponent implements OnInit, AfterViewInit {
  // 1 [expand with Table]
  codeForExpandTable = EXPAND_TABLE_HTML_SNIPPET;
  codeForExpandTableTs = EXPAND_TABLE_TS_SNIPPET;

  /** ================================
   * 📌 1. PROPIEDADES BÁSICAS
   * ================================ */
  clienteId: string;
  token: string | null = null;
  perTributarioId: string;

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
  perTributarioService = inject(PerTributarioService);
  comprobanteService = inject(ComprobanteService);

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

  // Fixed header
  displayedColumns = [
    'fechaEmision',
    'tipoComprobante',
    'serie',
    'numero',
    'numeroDocIdentidad',
    'nombreProveedor',
    'total',
  ];
  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];
  expandedElement: ComprobantePaginatedResponse | null = null;


  dataSource: ComprobantePaginatedResponse[] = [];

  search: string = '';
  pageIndex: number = 0; // MatPaginator usa base 0
  pageSize: number = 10;
  totalRecords = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // 2 [Sticky Header with Table]

  constructor(private route: ActivatedRoute, private snackBar: MatSnackBar) { }

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
  }

  ngAfterViewInit() {
    // 📌 Paginación desde el backend
    this.paginator.page.subscribe(() => {
      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.load_Comprobantes();
    });

    // 📌 Ordenamiento (solo si tu API soporta ordenamiento)
    this.sort.sortChange.subscribe(() => {
      this.pageIndex = 0; // cuando cambie orden reiniciamos a la primera página
      this.load_Comprobantes();
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

    const request: GetPerTributarioRequest = {
      clienteId: this.clienteId,
      anio: this.selectedYear,
      mes: this.selectedMonth,
    };

    // 🔹 Primero: verificar si existe el PerTributario
    this.perTributarioService.getByPeriodo(request).subscribe({
      next: (response: PerTributarioResponse) => {
        console.log('response', response)
        if (response) {
          // ✅ Existe → cargar comprobantes
          this.perTributarioId = response.id;
          this.load_Comprobantes();
          this.snackBar.open(
            `Período ${response.mes}/${response.anio} ya existe. Se cargaron los comprobantes.`,
            'Cerrar',
            { duration: 4000, panelClass: 'info-snackbar' }
          );
          this.isLoading.set(false);
        } else {
          // ❌ No existe → importar comprobantes
          this.importarPeriodo(request);
        }
      },
      error: (err) => {
        console.error('❌ Error al verificar PerTributario:', err);
        this.error.set(err.message || 'Error al verificar período');
        this.isLoading.set(false);
      }
    });
  }

  private importarPeriodo(request: GetPerTributarioRequest): void {
    this.sireService.importarComprobantes(request).subscribe({
      next: (response: PerTributarioResponse) => {
        console.log('✅ PerTributario creado e importado:', response);

        this.perTributarioId = response.id;
        this.load_Comprobantes();

        this.snackBar.open(
          `Se importó correctamente el período ${response.mes}/${response.anio}`,
          'Cerrar',
          { duration: 4000, panelClass: 'success-snackbar' }
        );
      },
      error: (err) => {
        console.error('❌ Error al importar comprobantes:', err);
        this.error.set(err.message || 'Error al importar comprobantes');
        this.snackBar.open('Hubo un error al importar comprobantes', 'Cerrar', {
          duration: 4000,
          panelClass: 'error-snackbar',
        });
      },
      complete: () => this.isLoading.set(false),
    });
  }


  load_Comprobantes(): void {
    this.isLoading.set(true);

    this.comprobanteService
      .getsPaginated(
        this.perTributarioId,
        this.search,
        this.pageSize,
        this.pageIndex + 1 // API espera base 1
      )
      .subscribe({
        next: (res) => {
          this.dataSource = res.data;
          this.totalRecords = res.total; // solo actualizas aquí

          // 🔹 Actualizar MatPaginator explícitamente
          if (this.paginator) {
            this.paginator.length = this.totalRecords;
          }
        },
        error: (err) => {
          console.error('Error al obtener comprobantes', err);
          this.error.set('No se pudieron cargar los comprobantes');
        },
        complete: () => this.isLoading.set(false),
      });
  }

  applyFilter(value: string) {
    this.search = value.trim().toLowerCase();
    this.pageIndex = 0;
    this.load_Comprobantes();
  }

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
