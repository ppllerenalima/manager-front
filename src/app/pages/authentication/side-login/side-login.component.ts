import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { BrandingComponent } from '../../../layouts/full/vertical/sidebar/branding.component';
import { AuthService, SignInRequest } from 'src/app/services/authentication/Auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-login',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, BrandingComponent, CommonModule],
  templateUrl: './side-login.component.html'
})
export class AppSideLoginComponent {
  options = this.settings.getOptions();
  errorMessage = '';

  form = new FormGroup({
    uname: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(
    private authService: AuthService,
    private settings: CoreService,
    private router: Router
  ) { }

  get f() {
    return this.form.controls;
  }

  login(): void {
    if (this.form.invalid) return;

    const request: SignInRequest = {
      userName: this.form.value.uname!,
      password: this.form.value.password!
    };

    this.authService.signIn(request).subscribe({
      next: () => this.router.navigate(['/dashboards/dashboard1']),
      error: () => this.errorMessage = 'Usuario o contraseña incorrectos',
    });
  }
}
