import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

function passwordValidator(control: FormControl): ValidationErrors | null {
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

  loginForm = new FormGroup({
    OldPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
    ]),
    NewPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      passwordValidator
    ]),
  });
}
