import { Component, inject, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { SafeUrlPipe } from '../../../../pipe/safe-url.pipe';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComprobanteService } from 'src/app/services/apps/compra-sire/comprobante.service';

interface GlosaForm {
  glosa: FormControl<string | null>;
}

@Component({
  selector: 'app-dialog-viewpdf',
  templateUrl: './dialog-viewpdf.component.html',
  imports: [
    MatDialogContent,
    MatDialogTitle,
    MatInputModule,
    MatButtonModule,
    SafeUrlPipe,
    FormsModule,

    MaterialModule,
    CommonModule,
    TablerIconsModule,
    ReactiveFormsModule,
  ],
})
export class AppDialogViewpdfComponent implements OnInit {
  dialogRef = inject(MatDialogRef);

  glosaForm = this.fb.group<GlosaForm>({
    glosa: this.fb.control<string | null>(null, Validators.required),
  });

  comprobanteService = inject(ComprobanteService);

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { pdfUrl: string; id: string; glosa?: string },
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // ✅ Si existe data.glosa, la coloca en el form
    if (this.data.glosa) {
      this.glosaForm.patchValue({
        glosa: this.data.glosa,
      });
    }
  }

  onSubmit() {
    if (this.glosaForm.valid) {
      const glosaValue = this.glosaForm.value.glosa;
      console.log('Glosa enviada:', glosaValue);

      this.comprobanteService
        .update(this.data.id, { id: this.data.id, glosa: glosaValue! })
        .subscribe({
          next: (res) => {
            console.log('==> res <==', res);
            const mensaje = '¡Comprobante actualizada exitosamente!'

            this.snackBar.open(mensaje, 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });

            this.dialogRef.close(true); // 🔹 cierra el diálogo y refresca lista
          },
          error: (err) => {
            console.error('Error en operación Comprobante:', err);
            this.snackBar.open(
              'Error al actualizar Comprobante',
              'Cerrar',
              { duration: 3000 }
            );
          },
        });

      // Cierra el modal y devuelve el valor
      this.dialogRef.close(glosaValue);
    } else {
      this.snackBar.open('Por favor ingrese una glosa válida', 'Cerrar', {
        duration: 3000,
      });
    }
  }
}
