import { Component, Inject, PLATFORM_ID, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    @Optional() private snackBar: MatSnackBar,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    
    // Call real API
    this.apiService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.data && response.data.token) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('jwt_token', response.data.token);
          }
          this.showSnackBar('Login successful!');
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.showSnackBar(error.message || 'Login failed. Please try again.', 5000, ['error-snackbar']);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  private showSnackBar(message: string, duration: number = 3000, panelClass: string[] = ['success-snackbar']): void {
    if (this.snackBar && isPlatformBrowser(this.platformId)) {
      this.snackBar.open(message, 'Close', {
        duration,
        panelClass
      });
    }
  }

  copyToClipboard(text: string): void {
    if (isPlatformBrowser(this.platformId)) {
      navigator.clipboard.writeText(text).then(() => {
        this.showSnackBar('Copied to clipboard!', 2000);
      }).catch(() => {
        this.showSnackBar('Failed to copy', 2000, ['error-snackbar']);
      });
    }
  }

  fillDemoCredentials(): void {
    this.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password'
    });
    
    this.showSnackBar('Demo credentials filled!', 2000);
  }
}
