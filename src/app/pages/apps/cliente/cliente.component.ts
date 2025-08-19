import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
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
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { ClienteService } from 'src/app/services/apps/cliente/cliente.service';
import { Cliente } from './models/cliente';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { FileUtils } from 'src/app/shared/utils/FileUtils';
import { FormUtils } from 'src/app/shared/utils/FormUtils';
import { InputUtils } from 'src/app/shared/utils/input-utils';
import { ClienteData } from './models/clienteData';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { GrupoService } from 'src/app/services/apps/grupo/grupo.service';
import { Grupo } from '../grupo/models/Grupo';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-cliente',
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
    CommonModule,
  ],
  templateUrl: './cliente.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppClienteComponent implements OnInit {
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);
  clienteService = inject(ClienteService);
  cliente = signal<Cliente[]>([]);

  searchText = signal<string>('');

  // Paginación
  pageSize = 5;
  pageIndex = 0;
  totalItems = signal(0);

  // Utilidades
  fileUtils = FileUtils;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadCliente();
  }

  // Carga la lista de clientes paginada
  loadCliente() {
    this.clienteService
      .getsPaginated(this.searchText(), this.pageSize, this.pageIndex)
      .subscribe({
        next: (res) => {
          console.log('res.data', res.data);

          this.cliente.set(res.data);
          this.totalItems.set(res.total);
        },
        error: (err) => {
          console.error('Error al cargar clientes:', err);
          this.snackBar.open('Error al cargar clientes', 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }

  // Maneja evento de cambio de página
  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadCliente();
  }

  // Abre el diálogo para agregar o editar un cliente
  openDialog(action: string, obj: Cliente | any): void {
    obj.action = action;

    console.log('openDialog obj:', obj);
    const dialogRef = this.dialog.open(AppClienteDialogContentComponent, {
      data: obj,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      if (result.event === 'Add') {
        this.addCliente(result.data);
      } else if (result.event === 'Edit') {
        this.updateCliente(result.data.id, result.data);
      } else if (result.event === 'Delete') {
        this.deleteCliente(result.data.id);
      }
    });
  }

  openEditDialog(cliente: Cliente): void {
    this.openDialog('Edit', cliente);
  }

  openDeleteDialog(cliente: Cliente): void {
    this.openDialog('Delete', cliente);
  }

  goToCompras(cliente: Cliente): void {
    console.log('goToCompras');

    console.log('cliente.id', cliente.id);
    // Navegación solo con el ID
    this.router.navigate(['/apps/compra-sire', cliente.id]);
  }

  // Filtro de búsqueda simple (puedes implementar backend o frontend)
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchText.set(filterValue);
    // Implementar filtrado si es necesario
    this.loadCliente();
  }

  addCliente(row_obj: any): void {
    const newCliente: Cliente = {
      ruc: row_obj.ruc,
      razonsocial: row_obj.razonsocial,
      numero: row_obj.numero,
      direccion: row_obj.direccion,
      image: row_obj.image,
      clientId: row_obj.clientId,
      clientSecret: row_obj.clientSecret,
      username: row_obj.username,
      password: row_obj.password,
      grupoId: row_obj.grupoId,
    };

    this.clienteService.add(newCliente).subscribe({
      next: () => {
        this.loadCliente();
        this.snackBar.open('¡Nuevo cliente añadido exitosamente!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        console.error('Error al registrar cliente:', err);
        this.snackBar.open('Error al registrar cliente', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  updateCliente(Id: string, cliente: Cliente): void {
    this.clienteService.update(Id, cliente).subscribe({
      next: () => {
        this.loadCliente();
        this.snackBar.open('¡Cliente actualizado exitosamente!', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        console.error('Error al actualizar cliente:', err);
        this.snackBar.open('Error al actualizar cliente', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  deleteCliente(Id: string): void {
    this.clienteService.delete(Id).subscribe({
      next: () => {
        this.loadCliente();
        this.snackBar.open('¡Cliente actualizado exitosamente!', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        console.error('Error al actualizar cliente:', err);
        this.snackBar.open('Error al actualizar cliente', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }
}

// ---------------------------------
// COMPONENTE DEL DIÁLOGO DE CLIENTE
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
  templateUrl: 'cliente-edit/cliente-edit.component.html',
})
export class AppClienteDialogContentComponent implements OnInit {
  // ----------------------------
  // Dependencies & Services
  // ----------------------------
  private readonly destroyRef = inject(DestroyRef);
  private readonly grupoService = inject(GrupoService);

  // ----------------------------
  // Signals & State
  // ----------------------------
  grupos = signal<Grupo[]>([]);
  rucErrorMessage = signal('');
  razonSocialErrorMessage = signal('');

  // ----------------------------
  // Reactive Form Controls
  // ----------------------------
  readonly ruc = new FormControl('', [
    Validators.required,
    Validators.minLength(11),
    Validators.maxLength(11),
    Validators.pattern(/^\d+$/),
  ]);

  readonly razonsocial = new FormControl('', [Validators.required]);

  // ----------------------------
  // Data from Dialog
  // ----------------------------
  action!: string;
  local_data!: Cliente;
  selectedFile: File | null = null;

  // ----------------------------
  // Utils (helpers)
  // ----------------------------
  FormUtils = FormUtils;
  InputUtils = InputUtils;

  // ----------------------------
  // Constructor
  // ----------------------------
  constructor(
    public dialogRef: MatDialogRef<AppClienteDialogContentComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: ClienteData
  ) {
    console.log('constructor data:', data);
  }

  // ----------------------------
  // Lifecycle
  // ----------------------------
  async ngOnInit(): Promise<void> {
    this.local_data = { ...this.data };
    this.action = this.data.action;

    await this.cargarGrupos();

    // Set grupoId only if viene en data
    if (this.data?.grupoId != null) {
      this.local_data.grupoId = this.data.grupoId;
    }

    // Register validations (con señales para errores)
    FormUtils.registerControlValidation(
      this.destroyRef,
      this.ruc,
      this.rucErrorMessage,
      'RUC',
      11
    );
    FormUtils.registerControlValidation(
      this.destroyRef,
      this.razonsocial,
      this.razonSocialErrorMessage,
      'Razón Social'
    );
  }

  // ----------------------------
  // Data Loading
  // ----------------------------
  private async cargarGrupos(): Promise<void> {
    try {
      const res = await firstValueFrom(this.grupoService.getsPaginated());
      const mapped = res.data.map((g) => ({
        ...g,
        isinactive: g.isinactive ? 'true' : 'false',
      })) as Grupo[];

      this.grupos.set(mapped);
    } catch (err) {
      console.error('Error cargando grupos:', err);
    }
  }

  // ----------------------------
  // Actions
  // ----------------------------
  async doAction(): Promise<void> {
    if (!this.local_data.image) {
      // default image si no se subió ninguna
      const defaultBase64 = await FileUtils.loadUrlAsBase64(
        'assets/images/profile/user-1.jpg'
      );
      this.local_data.image = defaultBase64;
    }

    this.dialogRef.close({ event: this.action, data: this.local_data });
  }

  closeDialog(): void {
    this.dialogRef.close({ event: 'Cancel' });
  }

  // ----------------------------
  // File Handling
  // ----------------------------
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        this.local_data.image = e.target?.result as string; // Base64
      };

      reader.readAsDataURL(this.selectedFile);
    }
  }
}
