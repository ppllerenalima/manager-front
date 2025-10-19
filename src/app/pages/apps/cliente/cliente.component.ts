import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Inject,
  inject,
  NgZone,
  OnInit,
  Optional,
  signal,
  ViewChild,
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
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  firstValueFrom,
  map,
  Observable,
  of,
  startWith,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { UsuarioService } from 'src/app/services/administration/usuario/usuario.service';
import { Usuario } from '../../administration/usuario/models/Usuario';
import { UsuarioPaginated } from '../../administration/usuario/models/UsuarioPaginated';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { GrupoPaginated } from '../grupo/models/GrupoPaginated';
import { AppClienteDialogComponent } from './cliente-dialog/cliente-dialog.component';
import { SelectResponse } from 'src/app/shared/models/SelectResponse';

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
  private readonly usuarioService = inject(UsuarioService);
  private readonly grupoService = inject(GrupoService);

  constructor(private router: Router) {}

  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);
  clienteService = inject(ClienteService);
  cliente = signal<Cliente[]>([]);

  searchText = signal<string>('');

  // Paginación
  pageSize = 8;
  pageIndex = 0;
  totalItems = signal(0);

  // Utilidades
  fileUtils = FileUtils;

  grupos = signal<Grupo[]>([]);

  selectedUserId?: string | null = null;
  selectedGrupoId?: string | null = null;
  filterControlUsuario = new FormControl<SelectResponse | string>('');
  filterControlGrupo = new FormControl<SelectResponse | string>('');
  filteredUsuarios!: Observable<SelectResponse[]>;
  filteredGrupos!: Observable<SelectResponse[]>;

  ngOnInit(): void {
    this.filteredUsuarios = this.filterControlUsuario.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => {
        const searchTerm =
          typeof value === 'string' ? value : value?.text || '';
        return this.buscarUsuarios(searchTerm);
      })
    );

    this.filteredGrupos = this.filterControlGrupo.valueChanges.pipe(
      startWith(''),
      debounceTime(300), // Espera 300ms antes de buscar
      distinctUntilChanged(), // Evita peticiones repetidas
      switchMap((value) => {
        const searchTerm =
          typeof value === 'string' ? value : value?.text || '';
        return this.buscarGrupos(searchTerm);
      })
    );

    this.load_Clientes();
  }

  // Carga la lista de clientes paginada
  load_Clientes() {
    this.clienteService
      .getPaginated(
        this.searchText(),
        this.pageSize,
        this.pageIndex,
        this.selectedGrupoId ?? undefined,
        this.selectedUserId ?? undefined // 👈 pasa el grupo si existe
      )
      .subscribe({
        next: (res) => {
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

  // Filtro de búsqueda simple (puedes implementar backend o frontend)
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchText.set(filterValue);
    // Implementar filtrado si es necesario
    this.load_Clientes();
  }

  onGrupoChange(grupoId: string | null) {
    this.selectedGrupoId = grupoId;
    this.pageIndex = 0; // reinicia a la primera página
    this.load_Clientes();
  }

  // Maneja evento de cambio de página
  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.load_Clientes();
  }

  // Abre el diálogo para agregar o editar un cliente

  openDialog(id: string | null) {
    const open = (data: any) => {
      this.dialog
        .open(AppClienteDialogComponent, {
          data: data, // lo que ya traes (puede ser null o un objeto con id, etc.)
        })
        .afterClosed()
        .subscribe(() => {
          // refrescar si es necesario
          this.load_Clientes();
        });
    };

    if (id === null) {
      // Crear → pasamos null o estructura base
      open(null);
    } else {
      // Editar → primero consultamos al backend
      this.clienteService.getById(id).subscribe({
        next: (res) => open(res),
        error: (err) => console.error('Error obteniendo usuario UO', err),
      });
    }
  }

  // openDialog(action: string, obj: Cliente | any): void {
  //   obj.action = action;

  //   console.log('openDialog obj:', obj);
  //   const dialogRef = this.dialog.open(AppClienteDialogContentComponent, {
  //     data: obj,
  //     autoFocus: false,
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (!result) return;

  //     if (result.event === 'Add') {
  //       this.addCliente(result.data);
  //     } else if (result.event === 'Edit') {
  //       this.updateCliente(result.data.id, result.data);
  //     } else if (result.event === 'Delete') {
  //       this.deleteCliente(result.data.id);
  //     }
  //   });
  // }

  // openEditDialog(cliente: Cliente): void {
  //   this.openDialog('Edit', cliente);
  // }

  openDeleteDialog(cliente: Cliente): void {
    // this.openDialog('Delete', cliente);
  }

  goToCompras(cliente: Cliente): void {
    this.router.navigate(['/apps/compra-sire', cliente.id]);
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

      userId: row_obj.userId,
      grupoId: row_obj.grupoId,

      grupo: row_obj.grupo,
    };

    console.log('newCliente', newCliente);

    // this.clienteService.add(newCliente).subscribe({
    //   next: () => {
    //     this.load_Clientes();
    //     this.snackBar.open('¡Nuevo cliente añadido exitosamente!', 'Close', {
    //       duration: 3000,
    //       horizontalPosition: 'center',
    //       verticalPosition: 'top',
    //     });
    //   },
    //   error: (err) => {
    //     console.error('Error al registrar cliente:', err);
    //     this.snackBar.open('Error al registrar cliente', 'Cerrar', {
    //       duration: 3000,
    //     });
    //   },
    // });
  }

  updateCliente(Id: string, cliente: Cliente): void {
    // this.clienteService.update(Id, cliente).subscribe({
    //   next: () => {
    //     this.load_Clientes();
    //     this.snackBar.open('¡Cliente actualizado exitosamente!', 'Cerrar', {
    //       duration: 3000,
    //       horizontalPosition: 'center',
    //       verticalPosition: 'top',
    //     });
    //   },
    //   error: (err) => {
    //     console.error('Error al actualizar cliente:', err);
    //     this.snackBar.open('Error al actualizar cliente', 'Cerrar', {
    //       duration: 3000,
    //     });
    //   },
    // });
  }

  deleteCliente(Id: string): void {
    this.clienteService.delete(Id).subscribe({
      next: () => {
        this.load_Clientes();
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

  // ----------------------------
  // Data Grupos
  // ----------------------------
  buscarUsuarios(search: string): Observable<SelectResponse[]> {
    return this.usuarioService.getsPaginated(search).pipe(
      map((res) =>
        (res.data || []).map((u) => ({
          id: u.id,
          text: u.nombreCompleto,
        }))
      ),
      catchError((err) => {
        console.error('Error cargando usuarios:', err);
        return of([] as SelectResponse[]);
      })
    );
  }

  displayUsuario(usuario: any): string {
    return usuario && usuario.text ? usuario.text : '';
  }

  onUsuarioSelected(usuario: SelectResponse): void {
    if (usuario === null) {
      this.selectedUserId = null;
    } else {
      this.selectedUserId = usuario.id;
    }
    
    this.load_Clientes();
  }
  //----------------------------------------------------------------------------------
  buscarGrupos(search: string): Observable<SelectResponse[]> {
    return this.grupoService.getsPaginated(search).pipe(
      map((res) =>
        (res.data || []).map((u) => ({
          id: u.id,
          text: u.descripcion,
        }))
      ),
      catchError((err) => {
        console.error('Error cargando grupos:', err);
        return of([] as SelectResponse[]);
      })
    );
  }

  displayGrupo(grupo: any): string {
    return grupo && grupo.text ? grupo.text : '';
  }

  onGrupoSelected(grupo: SelectResponse): void {
    if (grupo === null) {
      this.selectedGrupoId = null;
    } else {
      this.selectedGrupoId = grupo.id;
    }
    this.load_Clientes();
  }
}
