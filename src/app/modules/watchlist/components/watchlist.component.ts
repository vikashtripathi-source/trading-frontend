import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule
  ],
  styleUrls: ['./watchlist.component.css'],
  template: `
    <div class="watchlist-container">
      <mat-toolbar class="watchlist-header" color="primary">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="header-title">Watchlist Management</span>
        <button mat-icon-button (click)="refreshData()">
          <mat-icon>refresh</mat-icon>
        </button>
      </mat-toolbar>

      <div class="watchlist-content">
        <mat-tab-group class="watchlist-tabs">
          <mat-tab label="My Watchlists">
            <ng-template matTabContent>
              <div class="placeholder-content">
                <mat-card>
                  <mat-card-content>
                    <h3>My Watchlists</h3>
                    <p>Watchlist functionality will be implemented here.</p>
                  </mat-card-content>
                </mat-card>
              </div>
            </ng-template>
          </mat-tab>
          <mat-tab label="Create Watchlist">
            <ng-template matTabContent>
              <div class="placeholder-content">
                <mat-card>
                  <mat-card-content>
                    <h3>Create Watchlist</h3>
                    <p>Create watchlist functionality will be implemented here.</p>
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
    .watchlist-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .watchlist-header {
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

    .watchlist-tabs {
      margin-top: 20px;
    }

    @media (max-width: 768px) {
      .watchlist-container {
        padding: 10px;
      }
    }
  `]
})
export class WatchlistComponent implements OnInit {

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
  }

  refreshData(): void {
    console.log('Refreshing watchlist data');
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
