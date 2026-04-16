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
  styleUrls: ['./orders.component.css'],
  template: `
    <div class="orders-container">
      <header class="orders-header">
        <div class="header-left">
          <button mat-icon-button class="back-btn" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
        </div>
        <div class="header-center">
          <h1 class="header-title">Order Management</h1>
        </div>
        <div class="header-right">
          <button mat-icon-button class="refresh-btn" (click)="refreshData()">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </header>

      <main class="orders-content">
        <mat-tab-group class="modern-tabs" mat-align-tabs="center">
          <mat-tab label="Orders">
            <ng-template matTabContent>
              <div class="tab-content">
                <app-orders-list></app-orders-list>
              </div>
            </ng-template>
          </mat-tab>
          <mat-tab label="Create Order">
            <ng-template matTabContent>
              <div class="tab-content">
                <app-create-order></app-create-order>
              </div>
            </ng-template>
          </mat-tab>
        </mat-tab-group>
      </main>
    </div>
  `
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
