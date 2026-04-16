import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-trades',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule
  ],
  styleUrls: ['./trades.component.css'],
  template: `
    <div class="trades-container">
      <mat-toolbar class="trades-header" color="primary">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="header-title">Trade Management</span>
        <button mat-icon-button (click)="refreshData()">
          <mat-icon>refresh</mat-icon>
        </button>
      </mat-toolbar>

      <div class="trades-content">
        <mat-tab-group class="trades-tabs">
          <mat-tab label="Trade History">
            <ng-template matTabContent>
              <div class="placeholder-content">
                <mat-card>
                  <mat-card-content>
                    <h3>Trade History</h3>
                    <p>Trade history functionality will be implemented here.</p>
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
    .trades-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .trades-header {
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

    .trades-tabs {
      margin-top: 20px;
    }

    @media (max-width: 768px) {
      .trades-container {
        padding: 10px;
      }
    }
  `]
})
export class TradesComponent implements OnInit {

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
  }

  refreshData(): void {
    console.log('Refreshing trades data');
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
