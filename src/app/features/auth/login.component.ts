import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      dni: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
    console.log('7VII | 1.0');
  }

  get dni() {
    return this.loginForm.get('dni');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { dni, password } = this.loginForm.value;

    // Simulate async operation
    (async () => {
      const success = await this.authService.login(Number(dni), password);
      if (success) {
        this.router.navigate(['/home']);
      } else {
        this.errorMessage = 'DNI o contraseña incorrectos';
        this.isLoading = false;
      }
    })();
  }
}
