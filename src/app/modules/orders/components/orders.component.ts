import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { OrdersListComponent } from './orders-list.component';
import { CreateOrderComponent } from './create-order.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    OrdersListComponent,
    CreateOrderComponent
  ],
  template: `
    <div class="orders-container">
      <mat-toolbar class="orders-header" color="primary">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="header-title">Order Management</span>
        <button mat-icon-button (click)="refreshData()">
          <mat-icon>refresh</mat-icon>
        </button>
      </mat-toolbar>

      <div class="orders-content">
        <mat-tab-group class="orders-tabs">
          <mat-tab label="Orders">
            <ng-template matTabContent>
              <app-orders-list></app-orders-list>
            </ng-template>
          </mat-tab>
          <mat-tab label="Create Order">
            <ng-template matTabContent>
              <app-create-order></app-create-order>
            </ng-template>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .orders-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .orders-header {
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-title {
      font-size: 20px;
      font-weight: 600;
      flex: 1;
      text-align: center;
    }

    .orders-tabs {
      margin-top: 20px;
    }

    @media (max-width: 768px) {
      .orders-container {
        padding: 10px;
      }
    }
  `]
})
export class OrdersComponent implements OnInit {

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
  }

  refreshData(): void {
    // Refresh orders data
    console.log('Refreshing orders data');
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
