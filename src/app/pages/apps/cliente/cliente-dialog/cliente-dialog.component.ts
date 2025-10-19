import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { ClienteRequestDto } from '../models/ClienteRequestDto';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { SelectResponse } from 'src/app/shared/models/SelectResponse';
import { UsuarioService } from 'src/app/services/administration/usuario/usuario.service';
import { GrupoService } from 'src/app/services/apps/grupo/grupo.service';
import { ClienteService } from 'src/app/services/apps/cliente/cliente.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-cliente-dialog',
  imports: [
    MaterialModule,
    FormsModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    TablerIconsModule,

    CommonModule,
    MatAutocompleteModule,

    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
  ],
  templateUrl: './cliente-dialog.component.html',
  styleUrl: './cliente-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppClienteDialogComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly grupoService = inject(GrupoService);
  private readonly clienteService = inject(ClienteService);
  private readonly dialogRef = inject(MatDialogRef);

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: ClienteRequestDto,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  titulo: string = '';

  selectedFile: File | null = null;

  id!: string;
  esEdicion: Boolean;

  rucErrorMessage = signal('');
  razonSocialErrorMessage = signal('');

  filterControlUsuario = new FormControl<SelectResponse | string>('');
  filterControlGrupo = new FormControl<SelectResponse | string>('');
  filteredUsuarios!: Observable<SelectResponse[]>;
  filteredGrupos!: Observable<SelectResponse[]>;

  clienteForm = this.fb.group({
    isInactive: [false],
    ruc: ['', Validators.required],
    razonsocial: ['', Validators.required],
    numero: ['', Validators.required],
    direccion: ['', Validators.required],
    // image: this.fb.control<string | null>(null),
    image: [null as string | null],
    clientId: ['', Validators.required],
    clientSecret: ['', Validators.required],
    username: ['', Validators.required],
    password: ['', Validators.required],

    fechaRegistro: [new Date()],
    userId: [''],
    grupoId: [''],
  });

  private setFormValues(cliente: ClienteRequestDto): void {
    this.clienteForm.patchValue({
      isInactive: cliente.isInactive,
      ruc: cliente.ruc,
      razonsocial: cliente.razonsocial,
      numero: cliente.numero,
      direccion: cliente.direccion,
      image: cliente.image,
      clientId: cliente.clientId,
      clientSecret: cliente.clientSecret,
      username: cliente.username,
      password: cliente.password,
      fechaRegistro: cliente.fechaRegistro,
      userId: cliente.userId,
      grupoId: cliente.grupoId,
    });

    // ✅ Si el cliente ya tiene usuario asociado
    if (cliente.userId) {
      this.usuarioService.getById(cliente.userId).subscribe({
        next: (res) => {
          // Mapeamos la respuesta al formato SelectResponse
          const usuarioSelect: SelectResponse = {
            id: res.id,
            text: res.nombreCompleto,
          };

          // 🔹 Actualizamos el campo visual del autocomplete
          this.filterControlUsuario.setValue(usuarioSelect);

          console.log('Usuario cargado:', usuarioSelect);
        },
        error: (err) => console.error('Error obteniendo usuario', err),
      });
    }
    // ✅ Si el cliente ya tiene grupo
    if (cliente.grupoId) {
      this.grupoService.getById(cliente.grupoId).subscribe({
        next: (res) => {
          // Mapeamos la respuesta al formato SelectResponse
          const grupoSelect: SelectResponse = {
            id: res.id,
            text: res.descripcion,
          };

          // 🔹 Actualizamos el campo visual del autocomplete
          this.filterControlGrupo.setValue(grupoSelect);

          console.log('Grupo cargado:', grupoSelect);
        },
        error: (err) => console.error('Error obteniendo grupo', err),
      });
    }
  }

  ngOnInit(): void {
    this.esEdicion = !!this.data?.id;

    this.titulo = this.esEdicion ? 'Actualizar Cliente' : 'Agregar Cliente';

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

    if (this.esEdicion && this.data) {
      this.id = this.data.id!;
      this.setFormValues(this.data!);
    }
  }

  onSubmit() {
    if (this.clienteForm.invalid) return;

    const cliente: ClienteRequestDto =
      this.clienteForm.getRawValue() as ClienteRequestDto;

    console.log('Datos del cliente:', cliente);
    // aquí podrías llamar al servicio que guarda el cliente

    // 🔹 si es edición incluimos el id
    const request$ = this.esEdicion
      ? this.clienteService.update(this.data.id!, {
          id: this.data.id,
          ...cliente,
        })
      : this.clienteService.add(cliente);

    request$.subscribe({
      next: (res) => {
        console.log('==> res <==', res);
        const mensaje = this.esEdicion
          ? '¡Cliente actualizada exitosamente!'
          : '¡Nuevo cliente añadida exitosamente!';

        this.snackBar.open(mensaje, 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });

        this.dialogRef.close(true); // 🔹 cierra el diálogo y refresca lista
      },
      error: (err) => {
        console.error('Error en operación Cliente:', err);
        this.snackBar.open(
          this.esEdicion
            ? 'Error al actualizar Cliente'
            : 'Error al registrar Cliente',
          'Cerrar',
          { duration: 3000 }
        );
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // 🔹 Límite de 2 MB, por ejemplo
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('El archivo es demasiado grande. Máximo 2MB.');
        input.value = ''; // Limpia el input
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        this.clienteForm.get('image')?.setValue(base64);
      };

      reader.readAsDataURL(file);
    }
  }

  // onFileSelected(event: Event): void {
  //   const input = event.target as HTMLInputElement;

  //   if (input.files && input.files.length > 0) {
  //     this.selectedFile = input.files[0];
  //     const reader = new FileReader();

  //     reader.onload = (e) => {
  //       const base64 =  e.target?.result as string;
  //       this.clienteForm.get('image')?.setValue(base64);
  //     };

  //     reader.readAsDataURL(this.selectedFile);
  //   }
  // }
  //----------------------------------------------------------------------------------
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
    this.clienteForm.get('userId')?.setValue(usuario.id);
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
    this.clienteForm.get('grupoId')?.setValue(grupo.id);
  }
}
