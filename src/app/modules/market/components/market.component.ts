import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule
  ],
  styleUrls: ['./market.component.css'],
  template: `
    <div class="market-container">
      <mat-toolbar class="market-header" color="primary">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="header-title">Market Data</span>
        <button mat-icon-button (click)="refreshData()">
          <mat-icon>refresh</mat-icon>
        </button>
      </mat-toolbar>

      <div class="market-content">
        <mat-tab-group class="market-tabs">
          <mat-tab label="Search Stocks">
            <ng-template matTabContent>
              <div class="placeholder-content">
                <mat-card>
                  <mat-card-content>
                    <h3>Stock Search</h3>
                    <p>Stock search functionality will be implemented here.</p>
                  </mat-card-content>
                </mat-card>
              </div>
            </ng-template>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .market-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .market-header {
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

    .market-tabs {
      margin-top: 20px;
    }

    @media (max-width: 768px) {
      .market-container {
        padding: 10px;
      }
    }
  `]
})
export class MarketComponent implements OnInit {

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
  }

  refreshData(): void {
    console.log('Refreshing market data');
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
