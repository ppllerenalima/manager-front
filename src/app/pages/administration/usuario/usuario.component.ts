import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import { UsuarioPaginated } from './models/UsuarioPaginated';
import { ConfirmationService } from 'src/app/services/apps/confirmation/confirmation.service';
import { UsuarioService } from 'src/app/services/apps/usuario/usuario.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogUsuarioComponent } from './dialog-usuario/dialog-usuario.component';

@Component({
  selector: 'app-usuario',
  imports: [
    CommonModule, // 👈 Necesario para directivas básicas y pipes
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
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppUsuarioComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'item',
    'persona',
    'usuario',
    'isInactive',
    'actions',
  ];
  dataSource = new MatTableDataSource<UsuarioPaginated>([]);

  search: string = '';
  pageIndex: number = 0; // MatPaginator usa base 0
  pageSize: number = 10;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  usuarioService = inject(UsuarioService);
  confirmationService = inject(ConfirmationService);

  isLoading = false;

  dialog = inject(MatDialog);

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.load_Usuarios();
  }

  ngAfterViewInit() {
    // 📌 Paginación
    this.paginator.page.subscribe(() => {
      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.load_Usuarios();
    });

    // 📌 Ordenamiento
    this.sort.sortChange.subscribe(() => {
      // cuando cambie el orden reiniciamos a la primera página
      this.pageIndex = 0;
      this.load_Usuarios();
    });
  }

  load_Usuarios(): void {
    this.isLoading = true;

    this.usuarioService
      .getsPaginated(this.search, this.pageSize, this.pageIndex)
      .subscribe({
        next: (res) => {
          console.log('res.data', res.data);
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

  applyFilter(value: string) {
    this.search = value.trim().toLowerCase();
    this.pageIndex = 0;
    this.load_Usuarios();
  }

  openDialog(id: string | null) {
    const open = (data: any) => {
      this.dialog
        .open(DialogUsuarioComponent, {
          data: data, // lo que ya traes (puede ser null o un objeto con id, etc.)
        })
        .afterClosed()
        .subscribe(() => {
          // refrescar si es necesario
          this.load_Usuarios();
        });
    };

    if (id === null) {
      // Crear → pasamos null o estructura base
      open(null);
    } else {
      // Editar → primero consultamos al backend
      this.usuarioService.getById(id).subscribe({
        next: (res) => open(res),
        error: (err) => console.error('Error obteniendo usuario UO', err),
      });
    }
  }

  onSelectedDelete(id: string) {
    this.confirmationService.confirmAndExecute(
      '¡No podrás revertir esto!',
      this.usuarioService.delete(id),
      (response) => {
        this.snackBar.open(
          'Se eliminó el resgistro Cuenta Base SOL',
          'Cerrar',
          { duration: 3000 }
        );

        this.load_Usuarios();
      }
    );
  }
}
