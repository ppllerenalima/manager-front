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
import { UsuarioService } from 'src/app/services/administration/usuario/usuario.service';
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
  usuarioService = inject(UsuarioService);
  confirmationService = inject(ConfirmationService);
  dialog = inject(MatDialog);

  dataSource: UsuarioPaginated[] = [];
  search: string = '';

  pageIndex: number = 0; // MatPaginator usa base 0
  pageSize: number = 10;
  totalRecords: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  displayedColumns: string[] = [
    'item',
    'nombreCompleto',
    'userName',
    'role',
    'isInactive',
    'actions',
  ];

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
    this.usuarioService
      .getsPaginated(this.search, this.pageSize, this.pageIndex)
      .subscribe({
        next: (res) => {
          this.dataSource = res.data;
          this.totalRecords = res.total;

          if (this.paginator) {
            // 🔹 Asegura que los valores del paginator se sincronicen
            this.paginator.length = this.totalRecords;
            this.paginator.pageIndex = this.pageIndex;
          }
        },
        error: (err) => {
          console.error('Error al obtener usuarios', err);
          this.snackBar.open('Error al cargar Usuarios', 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }

  applyFilter(value: string) {
    this.search = value.trim().toLowerCase();
    this.pageIndex = 0;

    // 🔹 Reiniciar visualmente el paginator
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }

    this.load_Usuarios();
  }

  openDialog(id: string | null) {
    const open = (data: any) => {
      this.dialog
        .open(DialogUsuarioComponent, {
          data: data, // lo que ya traes (puede ser null o un objeto con id, etc.)
        })
        .afterClosed()
        .subscribe((result) => {
          // refrescar si es necesario
          if (result) {
            // puedes refrescar todo...
            this.load_Usuarios();

            // ...o simplemente agregarlo directo a tu lista
            // this.usuarios.push(result);
          }
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
      this.usuarioService.delete(id), // 👈 ahora devuelve Observable<void>
      () => {
        // ✅ no hay response porque el backend devuelve 204
        this.snackBar.open('¡Usuario eliminado exitosamente!', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });

        this.load_Usuarios(); // 🔄 refrescar lista
      }
    );
  }

  onResetearPassword(id: string) {
    this.confirmationService.confirmAndExecute(
      '¡Se restablecerá la contraseña de este usuario a una contraseña por defecto.!',
      this.usuarioService.resetPassword(id),
      (res) => {
        if (res.success) {
          this.load_Usuarios();
        } else {
        }
      },
      'La contraseña fue reiniciada correctamente.',
      'Confirmar reinicio de contraseña'
    );
  }
}
