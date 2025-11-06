import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
import {
  catchError,
  finalize,
  of,
  Subject,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { MaterialModule } from 'src/app/material.module';
import { SireService } from 'src/app/services/apps/customer/sire-list/sire-list.service';
import { registroSIRE } from '../customer/sire-list/listing/registroSIRE';
import { InvoiceService } from 'src/app/services/apps/invoice-view/invoice-view.service';
import { ConsultaCpeRequest } from '../invoice-view/Models/Requests/ConsultaCpeRequest';
import { GetPerTributarioRequest } from './Models/Requests/GetPerTributarioRequest';
import { ClienteService } from 'src/app/services/apps/cliente/cliente.service';
import { MatCardModule } from '@angular/material/card';
import { ComprobantePaginatedResponse } from './Models/Responses/ComprobantePaginatedResponse';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ComprobanteService } from 'src/app/services/apps/compra-sire/comprobante.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PerTributarioService } from 'src/app/services/apps/compra-sire/pertributario.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

// snippets
import { EXPAND_TABLE_HTML_SNIPPET } from '../../tables/expand-table/code/expand-table-html-snippet';
import { EXPAND_TABLE_TS_SNIPPET } from '../../tables/expand-table/code/expand-table-ts-snippet';
import { AppDialogViewpdfComponent } from './dialog-viewpdf/dialog-viewpdf.component';
import { MatDialog } from '@angular/material/dialog';
import { CpeService } from 'src/app/services/apps/compra-sire/cpe.service';
import { ReportsService } from 'src/app/services/apps/compra-sire/reports.service';
import { ComprobanteImportarGlosaRequest } from './Models/Requests/ComprobanteImportarGlosaRequest';
import { Note } from '../notes/note';
import { MessageService } from 'src/app/services/messages/messages.service';
import { Cpe_DescargarZipRequest } from './Models/Requests/Cpe_DescargarZipRequest';

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

  dialog = inject(MatDialog);

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
  cpeService = inject(CpeService);
  reportsService = inject(ReportsService);

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
    'tieneGlosa',
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

  // Paginación
  pageIndex: number = 0; // MatPaginator usa base 0
  pageSize: number = 10;
  totalRecords: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // 2 [Sticky Header with Table]
  tieneGlosa: boolean | null = null;
  conGlosa = signal(0);
  sinGlosa = signal(0);

  // total se puede calcular automáticamente 👇
  total = computed(() => this.conGlosa() + this.sinGlosa());

  selectedNote = signal<Note | null>(null);
  notes = signal<Note[]>([]);
  clrName = signal<string>('warning');
  currentNoteTitle = signal<string>('');
  selectedColor = signal<string | null>(null);
  sidePanelOpened = signal(true);

  constructor(
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private msg: MessageService
  ) {}

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

    this.perTributarioService
      .getByPeriodo(request)
      .pipe(
        switchMap((res) => {
          if (res.success && res.data) {
            this.perTributarioId = res.data.id;
            this.msg.info(
              `Período ${res.data.mes}/${res.data.anio} ya existe. Se cargaron los comprobantes.`
            );
            this.load_Comprobantes();
            return of(null); // termina aquí
          } else {
            // Si no existe, forzamos error para entrar al catchError
            return throwError(() => ({ status: 404 }));
          }
        }),
        catchError((err) => {
          console.log('err (catchError)', err);

          if (err.status === 404) {
            // No existe -> importamos desde SUNAT
            return this.sireService.importarComprobantes(request).pipe(
              tap((res) => {
                if (res.success && res.data) {
                  this.perTributarioId = res.data.id;
                  this.load_Comprobantes();
                  this.msg.success('Comprobantes importados correctamente.');
                } else if (res.statusCode === 202) {
                  this.msg.info(
                    res.message ||
                      'El ticket aún no ha sido aceptado por SUNAT.'
                  );
                } else {
                  this.msg.warning(
                    res.message || 'No se pudo importar los comprobantes.'
                  );
                }
              }),
              // 🧩 Manejo de errores de la importación
              catchError((err2) => {
                console.error('Error en importarComprobantes', err2);
                const msg =
                  err2?.error?.message ||
                  'Error al importar los comprobantes desde SUNAT.';
                this.msg.error(msg);
                return of(null); // devuelve un observable vacío para no romper la cadena
              })
            );
          } else {
            const msg =
              err?.error?.message || 'Error al buscar el período tributario.';
            this.msg.error(msg);
            return of(null);
          }
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();
  }

  // onSearchCompras(): void {
  //   // Reinicia estados
  //   this.error.set(null);
  //   this.registros.set([]);
  //   this.selectedComprobante.set(null);
  //   this.isLoading.set(true);

  //   const request: GetPerTributarioRequest = {
  //     clienteId: this.clienteId,
  //     anio: this.selectedYear,
  //     mes: this.selectedMonth,
  //   };

  //   // 🔹 Primero: verificar si existe el PerTributario
  //   this.perTributarioService
  //     .getByPeriodo(request)
  //     .pipe(
  //       finalize(() => this.isLoading.set(false)) // ✅ siempre se ejecuta al final
  //     )
  //     .subscribe({
  //       next: (res) => {
  //         this.perTributarioId = res.data!.id;
  //         this.load_Comprobantes();

  //         this.msg.info(
  //           `Período ${res.data!.mes}/${
  //             res.data!.anio
  //           } ya existe. Se cargaron los comprobantes.`
  //         );
  //       },
  //       error: (err) => {
  //         if (err.status === 404) {
  //           this.sireService.importarComprobantes(request).subscribe({
  //             next: (res) => {
  //               this.perTributarioId = res.data!.id;

  //               this.load_Comprobantes();
  //             },
  //             error: (err) => {
  //               const msg =
  //                 err?.error?.errorMessage || 'Error al importar comprobantes.';
  //               this.msg.error(msg);
  //             },
  //             complete: () => this.isLoading.set(false),
  //           });
  //         } else {
  //           const msg =
  //             err?.error?.message || 'Error al buscar el período tributario.';
  //           this.msg.error(msg);
  //         }
  //       },
  //     });
  // }

  onImportarPeriodo(request: GetPerTributarioRequest): void {}

  onMigrarExcel() {
    this.reportsService.descargarExcel(this.perTributarioId);
  }

  onImportarGlosa(): void {
    // ✅ Marca inicio de carga
    this.isLoading.set(true);

    const request: ComprobanteImportarGlosaRequest = {
      perTributarioId: this.perTributarioId,
      clienteId: this.clienteId,
    };

    this.comprobanteService
      .importarGlosa(request)
      .pipe(
        finalize(() => this.isLoading.set(false)) // ✅ Siempre se ejecuta al final
      )
      .subscribe({
        next: (res) => {
          console.log('✅ Glosa importada', res);

          if (res.success) {
            this.msg.success(res.message!);
          } else {
            this.msg.warning(res.message!);
          }

          this.load_Comprobantes();
        },
        error: (err) => {
          console.error('❌ Error al importar glosa', err);
          const msg = err?.error?.errorMessage || 'Error al importar glosa.';
          this.msg.error(msg);
        },
      });
  }

  // onImportarGlosa() {
  //   const request: ComprobanteImportarGlosaRequest = {
  //     perTributarioId: this.perTributarioId, // cambia por el GUID real
  //     clienteId: this.clienteId,
  //   };

  //   this.comprobanteService.importarGlosa(request).subscribe({
  //     next: (res) => {
  //       console.log('✅ Glosa importada', res);

  //       if (res.success) {
  //         this.msg.success(res.message!);
  //       } else {
  //         this.msg.warning(res.message!);
  //       }

  //       this.load_Comprobantes();
  //     },
  //     error: (err) => {
  //       console.error('❌ Error al importar glosa', err);

  //       const msg = err?.error?.errorMessage || 'Error al importar glosa.';
  //       this.msg.error(msg);
  //     },
  //   });
  // }

  load_Comprobantes(): void {
    this.isLoading.set(true);

    this.comprobanteService.getContadores(this.perTributarioId).subscribe({
      next: (res) => {
        // ✅ Validar que la respuesta tenga estructura esperada
        if (res?.success) {
          const conGlosa = res.data?.conGlosa ?? 0;
          const sinGlosa = res.data?.sinGlosa ?? 0;

          this.conGlosa.set(conGlosa);
          this.sinGlosa.set(sinGlosa);

          this.cdRef.markForCheck(); // 👈 fuerza la actualización

          console.log(`Con Glosa: ${conGlosa}`);
          console.log(`Sin Glosa: ${sinGlosa}`);
        } else {
          console.warn(
            '⚠️ Error en respuesta:',
            res?.message || 'Respuesta inválida del servidor'
          );
        }
      },
      error: (err) => {
        // 🧠 Manejo más detallado del error HTTP
        console.error('❌ Error al obtener contadores:', err);

        // Si querés mostrar un mensaje visual (ej. snackbar o toast)
        this.snackBar.open(
          err.error?.message || 'Error al obtener contadores.',
          'Cerrar',
          { duration: 3000, panelClass: ['snackbar-error'] }
        );
      },
    });

    this.comprobanteService
      .getsPaginated(
        this.perTributarioId,
        this.tieneGlosa,
        this.search,
        this.pageSize,
        this.pageIndex // API espera base 1
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

  openDialog(element: any) {
    const request: Cpe_DescargarZipRequest = {
      rucEmisor: element.numeroDocIdentidad,
      tipoComprobante: element.tipoComprobante,
      serie: element.serie,
      numero: element.numero,
      tipo: '01', // PDF
    };

    this.cpeService.descargarPdf(this.clienteId, request).subscribe({
      next: (blob: Blob) => {
        const fileURL = URL.createObjectURL(blob);

        this.dialog
          .open(AppDialogViewpdfComponent, {
            width: '65vw',
            height: '85vh',
            maxWidth: '65vw',
            maxHeight: '85vh',
            data: { pdfUrl: fileURL, id: element.id, glosa: element.glosa },
          })
          .afterClosed()
          .subscribe(() => {
            // refrescar si es necesario
            this.load_Comprobantes();
          });
      },
      error: async (err) => {
        console.error('err', err);

        let msg = 'Error desconocido';

        // Si el backend devolvió JSON dentro de un blob
        if (
          err.error instanceof Blob &&
          err.error.type === 'application/json'
        ) {
          const errorText = await err.error.text();
          const errorJson = JSON.parse(errorText);
          msg = errorJson.message || errorJson.details || 'Error del servidor';
        } else if (err.error?.message) {
          msg = err.error.message;
        }

        this.msg.error(msg);
      },
    });
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

  onSelect(tieneGlosa: boolean | null = null): void {
    this.tieneGlosa = tieneGlosa;
    this.pageIndex = 0; // cuando cambie orden reiniciamos a la primera página

    // 👇 Si existe el paginador, lo reseteamos visualmente también
    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.load_Comprobantes();
  }
}
