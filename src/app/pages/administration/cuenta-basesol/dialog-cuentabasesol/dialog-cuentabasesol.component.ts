import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { CuentaBaseSolService } from 'src/app/services/administration/cuenta-basesol/cuenta-basesol.service';
import { CuentaBaseSol } from '../models/CuentaBaseSol';

interface CuentaBaseSolForm {
  clientId: FormControl<string | null>;
  clientSecret: FormControl<string | null>;
  username: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-dialog-cuentabasesol',
  templateUrl: './dialog-cuentabasesol.component.html',
  styleUrls: ['./dialog-cuentabasesol.component.css'],
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
})
export class DialogCuentaBaseSolComponent implements OnInit {
  dialogRef = inject(MatDialogRef);

  cuentaBaseSolForm = this.fb.group<CuentaBaseSolForm>({
    clientId: this.fb.control<string | null>(null, Validators.required),
    clientSecret: this.fb.control<string | null>(null, Validators.required),
    username: this.fb.control<string | null>(null, Validators.required),
    password: this.fb.control<string | null>(null, Validators.required),
  });

  cuentaBaseSolService = inject(CuentaBaseSolService);

  titulo = '';

  private cuentaBaseSolId!: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: CuentaBaseSol, // UnidadOrganicaUsuario,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    const esEdicion = !!this.data?.id;

    this.titulo = esEdicion
      ? 'Actualizar Cuenta Base SOL'
      : 'Agregar nuevo Cuenta Base SOL';

    // 🔹 Solo después de cargar combos hacemos el patch
    if (esEdicion && this.data) {
      this.cuentaBaseSolId = this.data.id;
      this.prepararEdicion(this.data!);
    }
  }

  private prepararEdicion(data: CuentaBaseSol): void {
    console.log('data', data);
    this.cuentaBaseSolForm.patchValue({
      clientId: data.clientId,
      clientSecret: data.clientSecret,
      username: data.username,
      password: data.password,
    });
  }

  onSubmit() {
    if (this.cuentaBaseSolForm.invalid) return;

    const raw = this.cuentaBaseSolForm.getRawValue();
    const esEdicion = !!this.data; // 👈 más claro
    const payload = {
      clientId: raw.clientId!,
      clientSecret: raw.clientSecret!,
      username: raw.username!,
      password: raw.password!,
    };

    // 🔹 si es edición incluimos el id
    const request$ = esEdicion
      ? this.cuentaBaseSolService.update(this.data.id, {
          id: this.data.id,
          ...payload,
        })
      : this.cuentaBaseSolService.add(payload);

    request$.subscribe({
      next: (res) => {
        console.log('==> res <==', res);
        const mensaje = esEdicion
          ? '¡Cuenta Base SOL actualizada exitosamente!'
          : '¡Nueva Cuenta Base SOL añadida exitosamente!';

        this.snackBar.open(mensaje, 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });

        this.dialogRef.close(true); // 🔹 cierra el diálogo y refresca lista
      },
      error: (err) => {
        console.error('Error en operación Cuenta Base SOL:', err);
        this.snackBar.open(
          esEdicion
            ? 'Error al actualizar Cuenta Base SOL'
            : 'Error al registrar Cuenta Base SOL',
          'Cerrar',
          { duration: 3000 }
        );
      },
    });
  }
}
