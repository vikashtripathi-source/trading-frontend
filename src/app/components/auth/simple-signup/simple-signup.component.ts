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
  selector: 'app-simple-signup',
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
  templateUrl: './simple-signup.component.html',
  styleUrls: ['./simple-signup.component.css']
})
export class SimpleSignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['+919876543210', [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      dateOfBirth: ['1998-05-15', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.showSnackBar('Please fill all fields correctly', 'error');
      return;
    }

    if (this.signupForm.errors?.['passwordMismatch']) {
      this.showSnackBar('Passwords do not match', 'error');
      return;
    }

    this.isLoading = true;
    
    const formData = {
      ...this.signupForm.value,
      address: {
        street: '123 Shanti Nagar',
        city: 'Ghaziabad',
        state: 'Uttar Pradesh',
        zipCode: '201001',
        country: 'India',
        postalCode: null
      },
      preferences: {
        darkMode: false,
        language: 'en',
        timezone: 'UTC',
        notifications: true
      }
    };

    // Remove confirmPassword before sending to API
    delete formData.confirmPassword;

    console.log('Attempting signup with:', formData);

    this.apiService.register(formData).subscribe({
      next: (response) => {
        console.log('Signup response:', response);
        if (response.code === 201) {
          this.showSnackBar('Registration successful! Please login.', 'success');
          this.router.navigate(['/login']);
        } else {
          this.showSnackBar(response.message || 'Registration failed', 'error');
        }
      },
      error: (error) => {
        console.error('Signup error:', error);
        this.showSnackBar(
          error.error?.message || error.message || 'Registration failed. Please try again.', 
          'error'
        );
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  togglePassword(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
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

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
