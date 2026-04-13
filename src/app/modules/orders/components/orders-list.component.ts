import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';

import { ApiService, Order } from '../../../services/api.service';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule
  ],
  template: `
    <div class="orders-list-container">
      <mat-card class="orders-card">
        <mat-card-header>
          <h2>Your Orders</h2>
          <div class="header-actions">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Status Filter</mat-label>
              <mat-select (selectionChange)="onStatusFilterChange($event.value)" [value]="statusFilter">
                <mat-option value="">All Orders</mat-option>
                <mat-option value="PENDING">Pending</mat-option>
                <mat-option value="EXECUTED">Executed</mat-option>
                <mat-option value="CANCELLED">Cancelled</mat-option>
                <mat-option value="REJECTED">Rejected</mat-option>
                <mat-option value="PARTIALLY_FILLED">Partially Filled</mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-icon-button (click)="refreshOrders()">
              <mat-icon>refresh</mat-icon>
            </button>
          </div>
        </mat-card-header>
        
        <mat-card-content>
          <div class="orders-summary" *ngIf="filteredOrders.length > 0">
            <div class="summary-item">
              <span class="label">Total Orders:</span>
              <span class="value">{{ filteredOrders.length }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Pending:</span>
              <span class="value pending">{{ getPendingCount() }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Executed:</span>
              <span class="value executed">{{ getExecutedCount() }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Cancelled:</span>
              <span class="value cancelled">{{ getCancelledCount() }}</span>
            </div>
          </div>

          <div class="table-container" *ngIf="filteredOrders.length > 0; else noOrders">
            <table class="orders-table" *ngIf="filteredOrders.length > 0">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Symbol</th>
                  <th>Type</th>
                  <th>Side</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Stop Price</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of filteredOrders">
                  <td>
                    <span class="order-id">{{ order.id.substring(0, 8) }}...</span>
                  </td>
                  <td>
                    <strong>{{ order.symbol }}</strong>
                  </td>
                  <td>
                    <span class="order-type" [ngClass]="getOrderTypeClass(order.orderType)">
                      {{ order.orderType }}
                    </span>
                  </td>
                  <td>
                    <span class="order-side" [ngClass]="order.side === 'BUY' ? 'buy-side' : 'sell-side'">
                      {{ order.side }}
                    </span>
                  </td>
                  <td>
                    {{ order.quantity.toLocaleString() }}
                  </td>
                  <td>
                    {{ formatCurrency(order.price) }}
                  </td>
                  <td>
                    <span *ngIf="order.stopPrice > 0">{{ formatCurrency(order.stopPrice) }}</span>
                    <span *ngIf="order.stopPrice === 0">-</span>
                  </td>
                  <td>
                    <span class="order-status" [ngClass]="getStatusClass(order.status)">
                      {{ order.status }}
                    </span>
                  </td>
                  <td>
                    {{ formatDate(order.createdAt) }}
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button mat-icon-button size="small" color="primary" 
                              (click)="viewOrderDetails(order)" 
                              matTooltip="View Details">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      <button mat-icon-button size="small" color="warn" 
                              (click)="cancelOrder(order.id)" 
                              [disabled]="!canCancelOrder(order.status)"
                              matTooltip="Cancel Order">
                        <mat-icon>cancel</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <ng-template #noOrders>
            <div class="no-orders">
              <mat-icon class="no-data-icon">receipt_long</mat-icon>
              <h3>No Orders Found</h3>
              <p>You haven't placed any orders yet.</p>
              <button mat-raised-button color="primary" (click)="createNewOrder()">
                <mat-icon>add</mat-icon>
                Create Order
              </button>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .orders-list-container {
      padding: 20px;
    }

    .orders-card {
      margin-bottom: 20px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .filter-field {
      width: 180px;
    }

    .orders-summary {
      display: flex;
      gap: 30px;
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .summary-item .label {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }

    .summary-item .value {
      font-size: 16px;
      font-weight: 600;
    }

    .summary-item .value.pending {
      color: #ff9800;
    }

    .summary-item .value.executed {
      color: #4caf50;
    }

    .summary-item .value.cancelled {
      color: #f44336;
    }

    .table-container {
      overflow-x: auto;
    }

    .order-id {
      font-family: monospace;
      font-size: 12px;
      color: #666;
    }

    .action-buttons {
      display: flex;
      gap: 5px;
    }

    .no-orders {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .no-data-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .no-orders h3 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .no-orders p {
      margin: 0 0 20px 0;
    }

    @media (max-width: 768px) {
      .orders-list-container {
        padding: 10px;
      }

      .orders-summary {
        flex-direction: column;
        gap: 15px;
      }

      .header-actions {
        flex-direction: column;
        align-items: flex-end;
      }
    }
  `]
})
export class OrdersListComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  isLoading = false;
  statusFilter = '';

  ordersColumns: string[] = [
    'id',
    'symbol',
    'orderType',
    'side',
    'quantity',
    'price',
    'stopPrice',
    'status',
    'createdAt',
    'actions'
  ];

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    const userId = 'current-user';
    
    this.apiService.getUserOrders(userId, this.statusFilter || undefined).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.orders = response.data;
          this.filterOrders();
        } else {
          this.snackBar.open(response.message || 'Failed to load orders', 'Close', { 
            duration: 3000 
          });
        }
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.snackBar.open('Failed to load orders', 'Close', { duration: 3000 });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  filterOrders(): void {
    if (this.statusFilter) {
      this.filteredOrders = this.orders.filter(order => order.status === this.statusFilter);
    } else {
      this.filteredOrders = this.orders;
    }
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.filterOrders();
  }

  refreshOrders(): void {
    this.loadOrders();
  }

  viewOrderDetails(order: Order): void {
    console.log('View order details:', order);
    // Show order details modal or navigate to details page
  }

  cancelOrder(orderId: string): void {
    this.apiService.cancelOrder(orderId).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.snackBar.open('Order cancelled successfully', 'Close', { duration: 3000 });
          this.loadOrders();
        } else {
          this.snackBar.open(response.message || 'Failed to cancel order', 'Close', { 
            duration: 3000 
          });
        }
      },
      error: (error) => {
        console.error('Error cancelling order:', error);
        this.snackBar.open('Failed to cancel order', 'Close', { duration: 3000 });
      }
    });
  }

  createNewOrder(): void {
    // Navigate to create order page
    console.log('Navigate to create order');
  }

  canCancelOrder(status: string): boolean {
    return status === 'PENDING' || status === 'PARTIALLY_FILLED';
  }

  getPendingCount(): number {
    return this.orders.filter(order => order.status === 'PENDING').length;
  }

  getExecutedCount(): number {
    return this.orders.filter(order => order.status === 'EXECUTED').length;
  }

  getCancelledCount(): number {
    return this.orders.filter(order => order.status === 'CANCELLED').length;
  }

  getOrderTypeColor(orderType: string): string {
    switch (orderType) {
      case 'MARKET': return 'accent';
      case 'LIMIT': return 'primary';
      case 'STOP_LOSS': return 'warn';
      case 'STOP_LIMIT': return 'primary';
      default: return '';
    }
  }

  getOrderTypeClass(orderType: string): string {
    switch (orderType) {
      case 'MARKET': return 'market-order';
      case 'LIMIT': return 'limit-order';
      case 'STOP_LOSS': return 'stop-order';
      case 'STOP_LIMIT': return 'stop-order';
      default: return '';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'accent';
      case 'EXECUTED': return 'primary';
      case 'CANCELLED': return 'warn';
      case 'REJECTED': return 'warn';
      case 'PARTIALLY_FILLED': return 'primary';
      default: return '';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'pending-status';
      case 'EXECUTED': return 'executed-status';
      case 'CANCELLED': return 'cancelled-status';
      case 'REJECTED': return 'rejected-status';
      case 'PARTIALLY_FILLED': return 'partially-filled-status';
      default: return '';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
}
