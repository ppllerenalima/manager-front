import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  Inject,
  inject,
  OnInit,
  Optional,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { Grupo } from '../models/Grupo';
import { FormUtils } from 'src/app/shared/utils/FormUtils';
import { InputUtils } from 'src/app/shared/utils/input-utils';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { GrupoData } from '../models/GrupoData';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GrupoService } from 'src/app/services/apps/grupo/grupo.service';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AddGrupo } from '../models/AddGrupo';
import { EditGrupo } from '../models/EditGrupo';
import { GrupoPaginated } from '../models/GrupoPaginated';

@Component({
  selector: 'app-grupo-list',
  templateUrl: './grupo-list.component.html',
  imports: [
    MaterialModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
  ],
  styleUrls: ['./grupo-list.component.scss'],
})
export class AppGrupoListComponent implements OnInit {
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);
  grupoService = inject(GrupoService);
  grupoPaginated: MatTableDataSource<GrupoPaginated> =
    new MatTableDataSource<GrupoPaginated>();

  searchText = signal<string>('');

  // Paginación
  pageSize = 5;
  pageIndex = 0;
  totalItems = signal(0);

  displayedColumns: string[] = ['id', 'descripcion', 'isinactive', 'actions'];

  constructor() {}

  ngOnInit() {
    this.loadGrupo();
  }

  // Carga la lista de Grupos paginada
  loadGrupo() {
    this.grupoService
      .getsPaginated(this.searchText(), this.pageSize, this.pageIndex)
      .subscribe({
        next: (res) => {
          this.grupoPaginated.data = res.data;
          this.totalItems.set(res.total);
        },
        error: (err) => {
          console.error('Error al cargar Grupos:', err);
          this.snackBar.open('Error al cargar Grupos', 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }

  // Maneja evento de cambio de página
  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadGrupo();
  }

  // Abre el diálogo para agregar o editar un Grupo
  openDialog(action: string, obj: Grupo | any): void {
    obj.action = action;

    const dialogRef = this.dialog.open(AppGrupoDialogContentComponent, {
      data: obj,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      console.log(result.data);
      if (result.event === 'Add') {
        this.addGrupo(result.data);
      } else if (result.event === 'Edit') {
        this.updateGrupo(result.data.id, result.data);
      } else if (result.event === 'Delete') {
        this.deleteGrupo(result.data.id);
      }
    });
  }

  openEditDialog(grupo: Grupo): void {
    this.openDialog('Edit', grupo);
  }

  openDeleteDialog(grupo: Grupo): void {
    this.openDialog('Delete', grupo);
  }

  // Filtro de búsqueda simple (puedes implementar backend o frontend)
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchText.set(filterValue);
    // Implementar filtrado si es necesario
    this.loadGrupo();
  }

  addGrupo(row_obj: any): void {
    const newGrupo: AddGrupo = {
      descripcion: row_obj.descripcion,
    };

    this.grupoService.add(newGrupo).subscribe({
      next: () => {
        this.loadGrupo();
        this.snackBar.open('¡Nuevo Grupo añadido exitosamente!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        console.error('Error al registrar Grupo:', err);
        this.snackBar.open('Error al registrar Grupo', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  updateGrupo(Id: string, row_obj: any): void {
    const editGrupo: EditGrupo = {
      id: row_obj.id,
      descripcion: row_obj.descripcion,
      isinactive: row_obj.isinactive,
    };

    this.grupoService.update(Id, editGrupo).subscribe({
      next: () => {
        this.loadGrupo();
        this.snackBar.open('¡Grupo actualizado exitosamente!', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        console.error('Error al actualizar Grupo:', err);
        this.snackBar.open('Error al actualizar Grupo', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  deleteGrupo(Id: string): void {
    this.grupoService.delete(Id).subscribe({
      next: () => {
        this.loadGrupo();
        this.snackBar.open('¡Grupo actualizado exitosamente!', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        console.error('Error al actualizar Grupo:', err);
        this.snackBar.open('Error al actualizar Grupo', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }
}

// ---------------------------------
// COMPONENTE DEL DIÁLOGO DE GRUPO
// ---------------------------------
@Component({
  selector: 'app-dialog-content',
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TablerIconsModule,
  ],
  templateUrl: '../grupo-edit/grupo-edit.component.html',
})
export class AppGrupoDialogContentComponent {
  private readonly destroyRef = inject(DestroyRef);

  // Formularios reactivos con validación
  readonly descripcion = new FormControl('', [Validators.required]);
  descripcionErrorMessage = signal('');

  // Datos locales y utilidades
  action: string;
  local_data: Grupo | any;
  selectedFile: File | null = null;

  FormUtils = FormUtils;
  InputUtils = InputUtils;

  constructor(
    public dialogRef: MatDialogRef<AppGrupoDialogContentComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: GrupoData
  ) {
    this.local_data = { ...data };
    this.action = this.local_data.action;

    FormUtils.registerControlValidation(
      this.destroyRef,
      this.descripcion,
      this.descripcionErrorMessage,
      'Descripcion'
    );
  }

  // Acción principal para cerrar diálogo enviando datos (espera a la conversión de archivo)
  async doAction(): Promise<void> {
    // Cierra el diálogo y envía los datos
    this.dialogRef.close({ event: this.action, data: this.local_data });
  }

  // Cierra el diálogo sin cambios
  closeDialog(): void {
    this.dialogRef.close({ event: 'Cancel' });
  }
}
