import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Inject,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
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
import { ClientePermisoRequestDto } from '../models/ClientePermisoRequestDto';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CpeService } from 'src/app/services/apps/compra-sire/cpe.service';
import { MessageService } from 'src/app/services/messages/messages.service';
import { ClienteService } from 'src/app/services/apps/cliente/cliente.service';

@Component({
  selector: 'app-cliente-permiso',
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
  templateUrl: './cliente-permiso-dialog.component.html',
  styleUrl: './cliente-permiso-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppClientePermisoDialogComponent implements OnInit {
  private readonly cpeService = inject(CpeService);
  private readonly clienteService = inject(ClienteService);
  private readonly dialogRef = inject(MatDialogRef);

  titulo: string = '';

  clientePermisoForm = this.fb.group({
    token: ['', Validators.required],
    id: ['', Validators.required],
    nomApp: ['', Validators.required],
    desUrlApp: ['', Validators.required],
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) private clienteId: string,
    private fb: FormBuilder,
    private msg: MessageService
  ) {}

  ngOnInit(): void {
    this.titulo = 'Debe dar Permisos al Cliente - Mediante Cuenta SOL Sunat';
  }

  onSubmit() {
    if (this.clientePermisoForm.invalid) return;

    const request =
      this.clientePermisoForm.getRawValue() as ClientePermisoRequestDto;

    this.cpeService.actualizarPermisos(request).subscribe({
      next: (res) => {
        if (res.success) {
          // 🔹 Ahora ejecutamos el segundo sin mostrar mensajes intermedios
          this.clienteService.darPermiso(this.clienteId).subscribe({
            next: (resLocal) => {
              if (resLocal.success) {
                this.msg.success(
                  'Permiso actualizado correctamente en SUNAT y en el sistema.'
                );
                this.dialogRef.close(true);
              } else {
                this.msg.warning(
                  'Actualización en SUNAT correcta, pero error al guardar localmente.'
                );
              }
            },
            error: () => {
              this.msg.warning(
                'Actualización en SUNAT correcta, pero error al actualizar localmente.'
              );
            },
          });
        } else {
          this.msg.warning(res.message!);
        }
      },
      error: (err) => {
        const msg = err?.error?.errorMessage || 'Error al registrar usuario.';
        this.msg.error(msg);
      },
    });
  }
}
