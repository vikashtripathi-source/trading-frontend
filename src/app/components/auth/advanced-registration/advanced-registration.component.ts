import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-advanced-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule
  ],
  templateUrl: './advanced-registration.component.html',
  styleUrls: ['./advanced-registration.component.css']
})
export class AdvancedRegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  isLoading = false;
  currentStep = 1;
  totalSteps = 3;
  passwordStrength = 0;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private apiService: ApiService
  ) {
    this.registrationForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.registrationForm = this.fb.group({
      // Step 1: Basic Information
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ['', [Validators.required, Validators.pattern('^[+]?[0-9]{10,15}$')]],
      dateOfBirth: ['', [Validators.required, this.ageValidator(18)]],
      
      // Step 2: Address Information
      street: ['', [Validators.required, Validators.maxLength(100)]],
      city: ['', [Validators.required, Validators.maxLength(50)]],
      state: ['', [Validators.required, Validators.maxLength(50)]],
      zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}(-[0-9]{4})?$')]],
      country: ['', [Validators.required, Validators.maxLength(50)]],
      
      // Step 3: Security
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validators
  private ageValidator(minAge: number) {
    return (control: any) => {
      if (!control.value) return null;
      const birthDate = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= minAge ? null : { ageInvalid: true };
    };
  }

  private passwordStrengthValidator() {
    return (control: any) => {
      if (!control.value) return null;
      const value = control.value;
      let strength = 0;
      
      if (value.length >= 8) strength++;
      if (value.length >= 12) strength++;
      if (/[a-z]/.test(value)) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^a-zA-Z0-9]/.test(value)) strength++;
      
      this.passwordStrength = strength;
      return strength >= 3 ? null : { weakPassword: true };
    };
  }

  private passwordMatchValidator(form: FormGroup) {
    return () => {
      const password = form.get('password')?.value;
      const confirmPassword = form.get('confirmPassword')?.value;
      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  nextStep(): void {
    if (this.isCurrentStepValid()) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    this.currentStep--;
  }

  isCurrentStepValid(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!(this.registrationForm.get('firstName')?.valid !== true &&
               this.registrationForm.get('lastName')?.valid !== true &&
               this.registrationForm.get('email')?.valid !== true &&
               this.registrationForm.get('phone')?.valid !== true &&
               this.registrationForm.get('dateOfBirth')?.valid !== true);
      case 2:
        return !!(this.registrationForm.get('street')?.valid !== true &&
               this.registrationForm.get('city')?.valid !== true &&
               this.registrationForm.get('state')?.valid !== true &&
               this.registrationForm.get('zipCode')?.valid !== true &&
               this.registrationForm.get('country')?.valid !== true);
      case 3:
        return !!(this.registrationForm.get('password')?.valid !== true &&
               this.registrationForm.get('confirmPassword')?.valid !== true &&
               this.registrationForm.get('acceptTerms')?.valid !== true);
      default:
        return false;
    }
  }

  getPasswordStrengthText(): string {
    switch (this.passwordStrength) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      case 5:
        return 'Very Strong';
      default:
        return 'Weak';
    }
  }

  getPasswordStrengthColor(): string {
    switch (this.passwordStrength) {
      case 0:
      case 1:
        return '#ef4444';
      case 2:
        return '#f59e0b';
      case 3:
        return '#eab308';
      case 4:
        return '#22c55e';
      case 5:
        return '#10b981';
      default:
        return '#ef4444';
    }
  }

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      this.markFormGroupTouched(this.registrationForm);
      return;
    }

    this.isLoading = true;
    const formData = this.registrationForm.value;

    this.apiService.register(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('Registration successful! Please check your email for verification.', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(error.message || 'Registration failed. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  togglePassword(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  getStepTitle(): string {
    switch (this.currentStep) {
      case 1:
        return 'Personal Information';
      case 2:
        return 'Address Details';
      case 3:
        return 'Security Settings';
      default:
        return 'Registration';
    }
  }

  getStepDescription(): string {
    switch (this.currentStep) {
      case 1:
        return 'Tell us about yourself';
      case 2:
        return 'Where should we send your documents?';
      case 3:
        return 'Create a secure password for your account';
      default:
        return 'Complete your registration';
    }
  }
}
