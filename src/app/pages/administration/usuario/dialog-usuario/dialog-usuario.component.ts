import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MAT_DATE_LOCALE, MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { UsuarioService } from 'src/app/services/apps/usuario/usuario.service';
import { Usuario } from '../models/Usuario';

interface UsuarioForm {
  userName: FormControl<string | null>;
  email: FormControl<string | null>;

  apePaterno: FormControl<string | null>;
  apeMaterno: FormControl<string | null>;
  nombre: FormControl<string | null>;
}

@Component({
  selector: 'app-dialog-usuario',
  templateUrl: './dialog-usuario.component.html',
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
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
  ],
  styleUrl: './dialog-usuario.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogUsuarioComponent implements OnInit {
  dialogRef = inject(MatDialogRef);

  usuarioForm = this.fb.group<UsuarioForm>({
    userName: this.fb.control<string | null>(null, Validators.required),
    email: this.fb.control<string | null>(null, Validators.required),
    apePaterno: this.fb.control<string | null>(null, Validators.required),
    apeMaterno: this.fb.control<string | null>(null, Validators.required),
    nombre: this.fb.control<string | null>(null, Validators.required),
  });

  usuarioService = inject(UsuarioService);

  titulo = '';

  private UsuarioId!: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: Usuario, // UnidadOrganicaUsuario,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) {}

  async ngOnInit(): Promise<void> {
    const esEdicion = !!this.data?.id;

    this.titulo = esEdicion
      ? 'Actualizar Usuario'
      : 'Agregar nuevo Usuario';

    // 🔹 Solo después de cargar combos hacemos el patch
    if (esEdicion && this.data) {
      this.UsuarioId = this.data.id;
      this.prepararEdicion(this.data!);
    }
  }

  private prepararEdicion(data: Usuario): void {
    console.log('data', data);
    this.usuarioForm.patchValue({
      userName: data.userName,
      email: data.email,

      apePaterno: data.apePaterno,
      apeMaterno: data.apeMaterno,
      nombre: data.nombre,
    });
  }

  onSubmit() {
    if (this.usuarioForm.invalid) return;

    const raw = this.usuarioForm.getRawValue();
    const esEdicion = !!this.data; // 👈 más claro
    const payload = {
      userName: raw.userName!,
      email: raw.email!,

      apePaterno: raw.apePaterno!,
      apeMaterno: raw.apeMaterno!,
      nombre: raw.nombre!,
    };

    // 🔹 si es edición incluimos el id
    const request$ = esEdicion
      ? this.usuarioService.update(this.data.id, {
          id: this.data.id,
          ...payload,
        })
      : this.usuarioService.add(payload);

    request$.subscribe({
      next: (res) => {
        console.log('==> res <==', res);
        const mensaje = esEdicion
          ? '¡Usuario actualizada exitosamente!'
          : '¡Nuevo Usuario añadida exitosamente!';

        this.snackBar.open(mensaje, 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });

        this.dialogRef.close(true); // 🔹 cierra el diálogo y refresca lista
      },
      error: (err) => {
        console.error('Error en operación Usuario:', err);
        this.snackBar.open(
          esEdicion
            ? 'Error al actualizar Usuario'
            : 'Error al registrar Usuario',
          'Cerrar',
          { duration: 3000 }
        );
      },
    });
  }
}
