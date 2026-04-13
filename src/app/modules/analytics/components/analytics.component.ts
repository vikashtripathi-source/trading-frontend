import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule
  ],
  template: `
    <div class="analytics-container">
      <mat-toolbar class="analytics-header" color="primary">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="header-title">Trading Analytics</span>
        <button mat-icon-button (click)="refreshData()">
          <mat-icon>refresh</mat-icon>
        </button>
      </mat-toolbar>

      <div class="analytics-content">
        <mat-tab-group class="analytics-tabs">
          <mat-tab label="Trading Analytics">
            <ng-template matTabContent>
              <div class="placeholder-content">
                <mat-card>
                  <mat-card-content>
                    <h3>Trading Analytics</h3>
                    <p>Trading analytics functionality will be implemented here.</p>
                  </mat-card-content>
                </mat-card>
              </div>
            </ng-template>
          </mat-tab>
          <mat-tab label="Performance Analytics">
            <ng-template matTabContent>
              <div class="placeholder-content">
                <mat-card>
                  <mat-card-content>
                    <h3>Performance Analytics</h3>
                    <p>Performance analytics functionality will be implemented here.</p>
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
    .analytics-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .analytics-header {
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

    .analytics-tabs {
      margin-top: 20px;
    }

    @media (max-width: 768px) {
      .analytics-container {
        padding: 10px;
      }
    }
  `]
})
export class AnalyticsComponent implements OnInit {

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
  }

  refreshData(): void {
    console.log('Refreshing analytics data');
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
