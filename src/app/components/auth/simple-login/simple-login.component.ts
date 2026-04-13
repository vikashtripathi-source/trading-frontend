import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-simple-login',
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
    MatSnackBarModule
  ],
  templateUrl: './simple-login.component.html',
  styleUrls: ['./simple-login.component.css']
})
export class SimpleLoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      email: ['vikash.tripathi@example.com', [Validators.required, Validators.email]], // Pre-filled with your backend user
      password: ['password', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit(): void {
    console.log('Form submitted. Form valid:', this.loginForm.valid);
    console.log('Form errors:', this.loginForm.errors);
    console.log('Form controls status:', {
      email: this.loginForm.get('email')?.status,
      password: this.loginForm.get('password')?.status
    });
    
    if (this.loginForm.invalid) {
      this.showSnackBar('Please fill all fields correctly', 'error');
      return;
    }

    this.isLoading = true;
    this.loginForm.disable();
    
    console.log('Attempting login with:', {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      fullFormValue: this.loginForm.value,
      apiUrl: 'http://localhost:8081/api/auth/login'
    });

    this.apiService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        
        if (response.code === 200 && response.data && response.data.token) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('jwt_token', response.data.token);
            localStorage.setItem('user_data', JSON.stringify(response.data.user));
          }
          this.showSnackBar('Login successful!', 'success');
          this.router.navigate(['/dashboard']);
        } else {
          this.showSnackBar(response.message || 'Invalid response from server', 'error');
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.showSnackBar(
          error.error?.message || error.message || 'Login failed. Please try again.', 
          'error'
        );
      },
      complete: () => {
        this.isLoading = false;
        this.loginForm.enable();
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  private showSnackBar(message: string, type: 'success' | 'error' = 'success'): void {
    const snackBar = this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
    
    snackBar.afterDismissed().subscribe(() => {
      console.log('Snackbar dismissed');
    });
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }
}
