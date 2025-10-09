import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatDividerModule } from '@angular/material/divider';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/services/authentication/Auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChangePasswordRequest } from '../usuario/models/Requests/ChangePasswordRequest';

// ✅ Validador personalizado para fuerza de contraseña
export function passwordValidator(
  control: FormControl
): ValidationErrors | null {
  const value = control.value || '';
  const errors: any = {};

  if (value.length < 8) {
    errors.minLength = true;
  }
  if (!/[A-Z]/.test(value)) {
    errors.uppercase = true;
  }
  if (!/[a-z]/.test(value)) {
    errors.lowercase = true;
  }
  if (!/[0-9]/.test(value)) {
    errors.number = true;
  }
  if (!/[!@#$%^&*()_+\[\]{}:;<>?~\\|]/.test(value)) {
    errors.specialChar = true;
  }

  return Object.keys(errors).length ? errors : null;
}

// ✅ Validador para coincidencia de contraseñas
export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const group = control as FormGroup;
  const newPass = group.get('NewPassword');
  const confirmPass = group.get('ConfirmPassword');

  if (!newPass || !confirmPass) return null;

  if (confirmPass.errors && !confirmPass.errors['passwordMismatch']) {
    return null;
  }

  if (newPass.value !== confirmPass.value) {
    confirmPass.setErrors({ passwordMismatch: true });
  } else {
    confirmPass.setErrors(null);
  }

  return null;
};

@Component({
  selector: 'app-cuenta',
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

    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './cuenta.component.html',
  styleUrl: './cuenta.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppCuentaComponent {
  hide = true;
  alignhide = true;
  alignhide2 = true;

  isLoading = false;

  authService = inject(AuthService);

  // ✅ Aquí el validador de coincidencia se aplica solo al grupo
  loginForm = new FormGroup(
    {
      CurrentPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
      ]),
      NewPassword: new FormControl('', [
        Validators.required,
        passwordValidator,
      ]),
      ConfirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: passwordMatchValidator }
  );

  // 💡 Método auxiliar opcional (útil si quieres debuggear)
  get passwordsDoNotMatch(): boolean {
    return (
      this.loginForm.hasError('passwordMismatch') &&
      this.loginForm.get('ConfirmPassword')?.touched!
    );
  }

  constructor(private snackBar: MatSnackBar, private cdr: ChangeDetectorRef) {}

  ChangePassword(): void {
    if (this.loginForm.invalid) return;

    const request: ChangePasswordRequest = {
      currentPassword: this.loginForm.value.CurrentPassword!,
      newPassword: this.loginForm.value.NewPassword!,
    };

    const userId = this.authService.currentUser()?.userId!;
    this.isLoading = true;
    this.cdr.detectChanges(); // 👈 fuerza la actualización inmediata

    this.authService
      .changePassword(userId, request)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges(); // 👈 asegura que Angular lo vea
        })
      )
      .subscribe({
        next: (response) => {
          this.snackBar.open(response.message, 'Cerrar', {
            duration: 3000,
            panelClass: response.success
              ? ['snackbar-success']
              : ['snackbar-error'],
          });

          if (response.success) {
            this.loginForm.reset(); // 👈 opcional: limpiar campos
          }
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.message || 'Error al cambiar la contraseña.',
            'Cerrar',
            { duration: 3000, panelClass: ['snackbar-error'] }
          );
        },
      });
  }
}
