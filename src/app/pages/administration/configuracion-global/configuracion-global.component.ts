import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { ConfiguracionGlobalService } from 'src/app/services/administration/configuracion-global/configuracion-global.service';
import { CuentaBaseSolService } from 'src/app/services/administration/cuenta-basesol/cuenta-basesol.service';

interface CuentaBaseSolForm {
  ruc: FormControl<string | null>;
  clientId: FormControl<string | null>;
  clientSecret: FormControl<string | null>;
  username: FormControl<string | null>;
  password: FormControl<string | null>;
}

interface ConfiguracionGlobalForm {
  maxCaracteresGlosa: FormControl<number | null>;
}

@Component({
  selector: 'app-configuracion-global',
  imports: [
    MatCardModule,
    MatIconModule,
    TablerIconsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,

    MaterialModule,
    FormsModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    CommonModule,
    MatAutocompleteModule,
    MatDatepickerModule,
  ],
  templateUrl: './configuracion-global.component.html',
  styleUrl: './configuracion-global.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppConfiguracionGlobalComponent implements OnInit {
  cuentaBaseSolForm = this.fb.group<CuentaBaseSolForm>({
    ruc: this.fb.control<string | null>(null, Validators.required),
    clientId: this.fb.control<string | null>(null, Validators.required),
    clientSecret: this.fb.control<string | null>(null, Validators.required),
    username: this.fb.control<string | null>(null, Validators.required),
    password: this.fb.control<string | null>(null, Validators.required),
  });

  configuracionGlobalForm = this.fb.group<ConfiguracionGlobalForm>({
    maxCaracteresGlosa: this.fb.control<number | null>(
      null,
      Validators.required
    ),
  });

  cuentaBaseSolService = inject(CuentaBaseSolService);
  configuracionGlobalService = inject(ConfiguracionGlobalService);

  selectedTabIndex = 0;
  cuentaBaseSolId: string | null = null; // 👈 para saber si edita o crea
  configuracionGlobalId: string | null = null;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {}

  async ngOnInit(): Promise<void> {
    this.cuentaBaseSolService.getFirstOrDefault().subscribe({
      next: (res) => {
        if (!res) {
          this.snackBar.open('No se encontró ninguna cuenta base.', 'Cerrar', {
            duration: 3000,
          });
          return;
        }

        this.cuentaBaseSolId = res.data?.id!; // 👈 guardamos id

        this.cuentaBaseSolForm.patchValue({
          ruc: res.data?.ruc ?? '',
          clientId: res.data?.clientId ?? '',
          clientSecret: res.data?.clientSecret ?? '',
          username: res.data?.username ?? '',
          password: res.data?.password ?? '',
        });

        console.log('Cuenta Base encontrada:', res);
      },
      error: (err) => {
        this.snackBar.open('Error al obtener cuenta base', 'Cerrar', {
          duration: 3000,
        });
        console.error('Error al obtener cuenta base:', err);
      },
    });

    this.configuracionGlobalService.getFirstOrDefault().subscribe({
      next: (res) => {
        if (!res) {
          this.snackBar.open(
            'No se encontró ninguna configuración global.',
            'Cerrar',
            {
              duration: 3000,
            }
          );
          return;
        }

        this.configuracionGlobalId = res.data?.id!; // 👈 guardamos id

        this.configuracionGlobalForm.patchValue({
          maxCaracteresGlosa: res.data?.maxCaracteresGlosa ?? 0,
        });

        console.log('Cuenta Base encontrada:', res);
      },
      error: (err) => {
        this.snackBar.open('Error al obtener configuracion global', 'Cerrar', {
          duration: 3000,
        });
        console.error('Error al obtener configuración :', err);
      },
    });
  }

  guardar() {
    if (this.selectedTabIndex === 0) {
      this.guardarCuentaBaseSol();
    } else if (this.selectedTabIndex === 1) {
      this.guardarConfiguracionGlobal();
    }
  }

  private guardarCuentaBaseSol() {
    if (this.cuentaBaseSolForm.invalid) {
      this.snackBar.open('Formulario Cuenta Base SOL inválido', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const raw = this.cuentaBaseSolForm.getRawValue();
    const payload = {
      ruc: raw.ruc!,
      clientId: raw.clientId!,
      clientSecret: raw.clientSecret!,
      username: raw.username!,
      password: raw.password!,
    };

    const request$ = this.cuentaBaseSolId
      ? this.cuentaBaseSolService.update(this.cuentaBaseSolId, {
          id: this.cuentaBaseSolId,
          ...payload,
        })
      : this.cuentaBaseSolService.add(payload);

    request$.subscribe({
      next: (res) => {
        this.snackBar.open(
          this.cuentaBaseSolId
            ? '¡Cuenta Base SOL actualizada exitosamente!'
            : '¡Cuenta Base SOL registrada exitosamente!',
          'Cerrar',
          { duration: 3000 }
        );
        if (!this.cuentaBaseSolId && res.data?.id) {
          this.cuentaBaseSolId = res.data.id; // 👈 guardar id si se creó
        }
      },
      error: () => {
        this.snackBar.open(
          this.cuentaBaseSolId
            ? 'Error al actualizar Cuenta Base SOL'
            : 'Error al registrar Cuenta Base SOL',
          'Cerrar',
          { duration: 3000 }
        );
      },
    });
  }

  private guardarConfiguracionGlobal() {
    if (this.configuracionGlobalForm.invalid) {
      this.snackBar.open('Formulario Configuración Global inválido', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const raw = this.configuracionGlobalForm.getRawValue();
    const payload = { maxCaracteresGlosa: raw.maxCaracteresGlosa! };

    const request$ = this.configuracionGlobalId
      ? this.configuracionGlobalService.update(this.configuracionGlobalId, {
          id: this.configuracionGlobalId,
          ...payload,
        })
      : this.configuracionGlobalService.add(payload);

    request$.subscribe({
      next: (res) => {
        this.snackBar.open(
          this.configuracionGlobalId
            ? '¡Configuración Global actualizada!'
            : '¡Configuración Global registrada!',
          'Cerrar',
          { duration: 3000 }
        );
        if (!this.configuracionGlobalId && res.data?.id) {
          this.configuracionGlobalId = res.data.id;
        }
      },
      error: () => {
        this.snackBar.open(
          this.configuracionGlobalId
            ? 'Error al actualizar Configuración Global'
            : 'Error al registrar Configuración Global',
          'Cerrar',
          { duration: 3000 }
        );
      },
    });
  }
}
