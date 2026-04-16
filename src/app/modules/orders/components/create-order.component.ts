import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';

import { ApiService, CreateOrderRequest, Order } from '../../../services/api.service';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatSliderModule
  ],
  template: `
    <div class="create-order-container">
      <mat-card class="order-form-card">
        <mat-card-header>
          <h2>Create New Order</h2>
          <p class="card-subtitle">Place a buy or sell order for any stock</p>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="orderForm" (ngSubmit)="onSubmit()" class="order-form">
            <!-- Symbol Input -->
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field full-width">
                <mat-label>Stock Symbol</mat-label>
                <input matInput 
                       formControlName="symbol" 
                       placeholder="e.g., AAPL, GOOGL, MSFT"
                       (input)="onSymbolChange()">
                <mat-icon matSuffix>search</mat-icon>
                <mat-error *ngIf="orderForm.get('symbol')?.hasError('required')">
                  Symbol is required
                </mat-error>
                <mat-error *ngIf="orderForm.get('symbol')?.hasError('pattern')">
                  Invalid symbol format
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Order Side -->
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field full-width">
                <mat-label>Order Type</mat-label>
                <mat-radio-group formControlName="side" aria-label="Order Side">
                  <mat-radio-button value="BUY" color="primary">
                    <mat-icon>trending_up</mat-icon>
                    Buy
                  </mat-radio-button>
                  <mat-radio-button value="SELL" color="warn">
                    <mat-icon>trending_down</mat-icon>
                    Sell
                  </mat-radio-button>
                </mat-radio-group>
              </mat-form-field>
            </div>

            <!-- Order Type Selection -->
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field full-width">
                <mat-label>Order Type</mat-label>
                <mat-select formControlName="orderType" (selectionChange)="onOrderTypeChange()">
                  <mat-option value="MARKET">Market Order</mat-option>
                  <mat-option value="LIMIT">Limit Order</mat-option>
                  <mat-option value="STOP_LOSS">Stop Loss</mat-option>
                  <mat-option value="STOP_LIMIT">Stop Limit</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Quantity and Price -->
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Quantity</mat-label>
                <input matInput 
                       type="number" 
                       formControlName="quantity" 
                       placeholder="Number of shares"
                       min="1">
                <mat-icon matSuffix>inventory_2</mat-icon>
                <mat-error *ngIf="orderForm.get('quantity')?.hasError('required')">
                  Quantity is required
                </mat-error>
                <mat-error *ngIf="orderForm.get('quantity')?.hasError('min')">
                  Minimum quantity is 1
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field" 
                              *ngIf="showPriceField">
                <mat-label>Price</mat-label>
                <input matInput 
                       type="number" 
                       formControlName="price" 
                       placeholder="Price per share"
                       min="0.01"
                       step="0.01">
                <mat-icon matSuffix>attach_money</mat-icon>
                <mat-error *ngIf="orderForm.get('price')?.hasError('required')">
                  Price is required
                </mat-error>
                <mat-error *ngIf="orderForm.get('price')?.hasError('min')">
                  Price must be greater than 0
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Stop Price (for Stop Loss and Stop Limit) -->
            <div class="form-row" *ngIf="showStopPriceField">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Stop Price</mat-label>
                <input matInput 
                       type="number" 
                       formControlName="stopPrice" 
                       placeholder="Stop price"
                       min="0.01"
                       step="0.01">
                <mat-icon matSuffix>price_change</mat-icon>
                <mat-error *ngIf="orderForm.get('stopPrice')?.hasError('required')">
                  Stop price is required
                </mat-error>
                <mat-error *ngIf="orderForm.get('stopPrice')?.hasError('min')">
                  Stop price must be greater than 0
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Order Summary -->
            <div class="order-summary" *ngIf="orderForm.valid">
              <h3>Order Summary</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="label">Symbol:</span>
                  <span class="value">{{ orderForm.value.symbol }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Action:</span>
                  <span class="value" [ngClass]="orderForm.value.side.toLowerCase()">
                    {{ orderForm.value.side }}
                  </span>
                </div>
                <div class="summary-item">
                  <span class="label">Type:</span>
                  <span class="value">{{ orderForm.value.orderType }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Quantity:</span>
                  <span class="value">{{ orderForm.value.quantity }} shares</span>
                </div>
                <div class="summary-item" *ngIf="showPriceField">
                  <span class="label">Price:</span>
                  <span class="value">{{ formatCurrency(orderForm.value.price) }}</span>
                </div>
                <div class="summary-item" *ngIf="showStopPriceField">
                  <span class="label">Stop Price:</span>
                  <span class="value">{{ formatCurrency(orderForm.value.stopPrice) }}</span>
                </div>
                <div class="summary-item total">
                  <span class="label">Total Value:</span>
                  <span class="value">{{ formatCurrency(calculateTotalValue()) }}</span>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button mat-button type="button" (click)="resetForm()" [disabled]="isLoading">
                <mat-icon>clear</mat-icon>
                Reset
              </button>
              <button mat-raised-button 
                      type="submit" 
                      color="primary"
                      [disabled]="orderForm.invalid || isLoading"
                      class="submit-btn">
                <mat-icon *ngIf="isLoading" class="spinner">refresh</mat-icon>
                {{ isLoading ? 'Placing Order...' : 'Place Order' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Market Data Preview -->
      <mat-card class="market-data-card" *ngIf="marketData">
        <mat-card-header>
          <h3>Market Data</h3>
        </mat-card-header>
        <mat-card-content>
          <div class="market-data-grid">
            <div class="data-item">
              <span class="label">Current Price:</span>
              <span class="value">{{ formatCurrency(marketData.currentPrice) }}</span>
            </div>
            <div class="data-item">
              <span class="label">Day Change:</span>
              <span class="value" [ngClass]="getProfitLossClass(marketData.change)">
                {{ formatCurrency(marketData.change) }} ({{ formatPercentage(marketData.changePercentage) }})
              </span>
            </div>
            <div class="data-item">
              <span class="label">Volume:</span>
              <span class="value">{{ marketData.volume.toLocaleString() }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .create-order-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .order-form-card, .market-data-card {
      margin-bottom: 20px;
    }

    .card-subtitle {
      color: #666;
      margin: 0;
    }

    .order-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .form-field {
      flex: 1;
      min-width: 200px;
    }

    .form-field.full-width {
      width: 100%;
    }

    mat-radio-group {
      display: flex;
      gap: 20px;
      margin-top: 10px;
    }

    mat-radio-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .order-summary {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .order-summary h3 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .summary-item.total {
      border-top: 2px solid #333;
      padding-top: 12px;
      margin-top: 8px;
      font-weight: 600;
    }

    .summary-item .label {
      color: #666;
      font-weight: 500;
    }

    .summary-item .value {
      font-weight: 600;
      color: #333;
    }

    .summary-item .value.buy {
      color: #4caf50;
    }

    .summary-item .value.sell {
      color: #f44336;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      margin-top: 20px;
    }

    .submit-btn {
      min-width: 150px;
    }

    .spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .market-data-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .data-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .data-item .label {
      color: #666;
      font-weight: 500;
    }

    .data-item .value {
      font-weight: 600;
    }

    .profit {
      color: #4caf50;
    }

    .loss {
      color: #f44336;
    }

    @media (max-width: 768px) {
      .create-order-container {
        padding: 10px;
      }

      .form-row {
        flex-direction: column;
        gap: 15px;
      }

      .form-field {
        min-width: 100%;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      mat-radio-group {
        flex-direction: column;
        gap: 10px;
      }
    }
  `]
})
export class CreateOrderComponent implements OnInit {
  orderForm: FormGroup;
  isLoading = false;
  marketData: any = null;
  showPriceField = false;
  showStopPriceField = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {
    this.orderForm = this.fb.group({
      symbol: ['', [Validators.required, Validators.pattern('^[A-Z]{1,5}$')]],
      side: ['BUY', Validators.required],
      orderType: ['MARKET', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [null],
      stopPrice: [null]
    });
  }

  ngOnInit(): void {
    this.onOrderTypeChange();
  }

  onOrderTypeChange(): void {
    const orderType = this.orderForm.get('orderType')?.value;
    
    // Reset price and stop price fields
    this.orderForm.get('price')?.clearValidators();
    this.orderForm.get('stopPrice')?.clearValidators();
    
    this.showPriceField = orderType !== 'MARKET';
    this.showStopPriceField = orderType === 'STOP_LOSS' || orderType === 'STOP_LIMIT';
    
    if (this.showPriceField) {
      this.orderForm.get('price')?.setValidators([Validators.required, Validators.min(0.01)]);
    }
    
    if (this.showStopPriceField) {
      this.orderForm.get('stopPrice')?.setValidators([Validators.required, Validators.min(0.01)]);
    }
    
    this.orderForm.get('price')?.updateValueAndValidity();
    this.orderForm.get('stopPrice')?.updateValueAndValidity();
  }

  onSymbolChange(): void {
    const symbol = this.orderForm.get('symbol')?.value;
    if (symbol && symbol.length >= 1) {
      this.loadMarketData(symbol.toUpperCase());
    } else {
      this.marketData = null;
    }
  }

  loadMarketData(symbol: string): void {
    this.apiService.getMarketData(symbol).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.marketData = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading market data:', error);
        this.marketData = null;
      }
    });
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      return;
    }

    this.isLoading = true;
    // Disable all form controls during submission
    this.orderForm.disable();
    
    const orderRequest: CreateOrderRequest = {
      userId: 'current-user',
      symbol: this.orderForm.value.symbol.toUpperCase(),
      orderType: this.orderForm.value.orderType,
      side: this.orderForm.value.side,
      quantity: this.orderForm.value.quantity,
      price: this.orderForm.value.price || 0,
      stopPrice: this.orderForm.value.stopPrice || 0
    };

    this.apiService.createOrder(orderRequest).subscribe({
      next: (response) => {
        if (response.status === 201) {
          this.snackBar.open('Order placed successfully!', 'Close', { duration: 3000 });
          this.resetForm();
        } else {
          this.snackBar.open(response.message || 'Failed to place order', 'Close', { 
            duration: 3000 
          });
        }
      },
      error: (error) => {
        console.error('Error placing order:', error);
        this.snackBar.open('Failed to place order', 'Close', { duration: 3000 });
      },
      complete: () => {
        this.isLoading = false;
        // Re-enable all form controls after submission
        this.orderForm.enable();
      }
    });
  }

  resetForm(): void {
    this.orderForm.reset({
      symbol: '',
      side: 'BUY',
      orderType: 'MARKET',
      quantity: 1,
      price: null,
      stopPrice: null
    });
    this.marketData = null;
    this.onOrderTypeChange();
  }

  calculateTotalValue(): number {
    const quantity = this.orderForm.value.quantity || 0;
    const price = this.orderForm.value.price || (this.marketData?.currentPrice || 0);
    return quantity * price;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  getProfitLossClass(value: number): string {
    return value >= 0 ? 'profit' : 'loss';
  }
}
