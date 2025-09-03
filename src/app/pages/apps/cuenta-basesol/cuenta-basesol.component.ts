import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'app-cuenta-basesol',
  templateUrl: './cuenta-basesol.component.html',
  styleUrls: ['./cuenta-basesol.component.css'],
  imports: [
    CommonModule, // 👈 Necesario para directivas básicas y pipes
    DatePipe, // 👈 Ahora puedes usar |date en tu HTML
    MatButtonModule, // 👈 Agregar este

    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatCard,
    MatCardContent,
    TablerIconsModule,
  ],
})
export class CuentaBasesolComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'item',
    'clientId',
    'clientSecret',
    'username',
    'password',
    'estado',
    'actions',
  ];
  dataSource =
    new MatTableDataSource<CuentaBaseSolPaginatedResponse>(
      []
    );

  search: string = '';
  pageIndex: number = 0; // MatPaginator usa base 0
  pageSize: number = 10;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  cuentaBaseSolService = inject(CuentaBaseSolService);

  isLoading = false;

  dialog = inject(MatDialog);

  // 👇 propiedad para guardar el userId
  private userId!: string;
  private idEntidad!: number;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.load_CuentaBaseSols();
  }

  ngAfterViewInit() {
    // 📌 Paginación
    this.paginator.page.subscribe(() => {
      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.load_CuentaBaseSols();
    });

    // 📌 Ordenamiento
    this.sort.sortChange.subscribe(() => {
      // cuando cambie el orden reiniciamos a la primera página
      this.pageIndex = 0;
      this.load_CuentaBaseSols();
    });
  }

  load_CuentaBaseSols(): void {
    this.isLoading = true;

    this.cuentaBaseSolService
      .getPaginado_UsuarioAsociadoUOs(
        this.idEntidad,
        this.search,
        this.pageIndex + 1, // API espera base 1
        this.pageSize,
        this.userId
      )
      .subscribe({
        next: (res) => {
          this.dataSource.data = res.data;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al obtener aplicaciones', err);
          //this.isLoading = false; // ⚠️ No olvides apagar loading en error
        },
      });
  }

  applyFilter(event: Event) {
    this.search = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.pageIndex = 0; // reiniciamos a la primera página
    this.load_CuentaBaseSols();
  }

  openDialog(id: number | null) {
    const open = (data: any) => {
      this.dialog
        .open(DialogUnidadorganicaUserComponent, {
          data: {
            data, // lo que ya traes (puede ser null o un objeto con id, etc.)
            userId: this.userId, // 👈 aquí agregas otro valor
          },
        })
        .afterClosed()
        .subscribe(() => {
          // refrescar si es necesario
          this.load_CuentaBaseSols();
        });
    };

    if (id === null) {
      // Crear → pasamos null o estructura base
      open(null);
    } else {
      // Editar → primero consultamos al backend
      this.cuentaBaseSolService.get(id).subscribe({
        next: (res) => open(res.data),
        error: (err) => console.error('Error obteniendo usuario UO', err),
      });
    }
  }

  volverAUsuarios() {
    this.router.navigate(['/pages/user']);
  }
}
