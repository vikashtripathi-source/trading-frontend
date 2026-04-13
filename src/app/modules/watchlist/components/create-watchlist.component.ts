import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';

import { ApiService, CreateWatchlistRequest } from '../../../services/api.service';

@Component({
  selector: 'app-create-watchlist',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule
  ],
  template: `
    <div class="create-watchlist-container">
      <mat-card class="watchlist-form-card">
        <mat-card-header>
          <h2>Create New Watchlist</h2>
          <p class="card-subtitle">Add stocks to track and monitor</p>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="watchlistForm" (ngSubmit)="onSubmit()" class="watchlist-form">
            <!-- Watchlist Name -->
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Watchlist Name</mat-label>
              <input matInput 
                     formControlName="name" 
                     placeholder="Enter watchlist name">
              <mat-icon matSuffix>list</mat-icon>
              <mat-error *ngIf="watchlistForm.get('name')?.hasError('required')">
                Name is required
              </mat-error>
            </mat-form-field>

            <!-- Description -->
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Description</mat-label>
              <textarea matInput 
                        formControlName="description" 
                        placeholder="Optional description"
                        rows="3">
              </textarea>
              <mat-icon matSuffix>description</mat-icon>
            </mat-form-field>

            <!-- Stock Symbols -->
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Stock Symbols</mat-label>
              <input matInput 
                     formControlName="symbolsInput" 
                     placeholder="Enter symbols separated by commas (e.g., AAPL, GOOGL, MSFT)"
                     (keyup.enter)="addSymbol()">
              <mat-icon matSuffix>add</mat-icon>
            </mat-form-field>

            <!-- Added Symbols -->
            <div class="symbols-section" *ngIf="symbols.length > 0">
              <h3>Added Symbols:</h3>
              <div class="symbols-list">
                <span *ngFor="let symbol of symbols" class="symbol-chip">
                  {{ symbol }}
                  <button mat-icon-button size="small" (click)="removeSymbol(symbol)">
                    <mat-icon>cancel</mat-icon>
                  </button>
                </span>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button mat-button type="button" (click)="resetForm()">
                <mat-icon>clear</mat-icon>
                Reset
              </button>
              <button mat-raised-button 
                      type="submit" 
                      color="primary"
                      [disabled]="watchlistForm.invalid || symbols.length === 0">
                <mat-icon>save</mat-icon>
                Create Watchlist
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .create-watchlist-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }

    .watchlist-form-card {
      margin-bottom: 20px;
    }

    .card-subtitle {
      color: #666;
      margin: 0;
    }

    .watchlist-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-field {
      width: 100%;
    }

    .symbols-section {
      margin: 20px 0;
    }

    .symbols-section h3 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      margin-top: 20px;
    }

    @media (max-width: 768px) {
      .create-watchlist-container {
        padding: 10px;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class CreateWatchlistComponent implements OnInit {
  watchlistForm: FormGroup;
  symbols: string[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {
    this.watchlistForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      symbolsInput: ['']
    });
  }

  ngOnInit(): void {
  }

  addSymbol(): void {
    const input = this.watchlistForm.get('symbolsInput')?.value?.trim();
    if (input && !this.symbols.includes(input.toUpperCase())) {
      this.symbols.push(input.toUpperCase());
      this.watchlistForm.get('symbolsInput')?.setValue('');
    }
  }

  removeSymbol(symbol: string): void {
    this.symbols = this.symbols.filter(s => s !== symbol);
  }

  onSubmit(): void {
    if (this.watchlistForm.invalid || this.symbols.length === 0) {
      return;
    }

    const watchlistRequest: CreateWatchlistRequest = {
      userId: 'current-user',
      name: this.watchlistForm.value.name,
      symbols: this.symbols,
      isDefault: false
    };

    this.apiService.createWatchlist(watchlistRequest).subscribe({
      next: (response: any) => {
        if (response.code === 201) {
          this.snackBar.open('Watchlist created successfully!', 'Close', { duration: 3000 });
          this.resetForm();
        } else {
          this.snackBar.open(response.message || 'Failed to create watchlist', 'Close', { 
            duration: 3000 
          });
        }
      },
      error: (error: any) => {
        console.error('Error creating watchlist:', error);
        this.snackBar.open('Failed to create watchlist', 'Close', { duration: 3000 });
      }
    });
  }

  resetForm(): void {
    this.watchlistForm.reset({
      name: '',
      description: '',
      symbolsInput: ''
    });
    this.symbols = [];
  }
}
