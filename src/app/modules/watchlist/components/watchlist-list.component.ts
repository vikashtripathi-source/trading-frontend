import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { ApiService, Watchlist } from '../../../services/api.service';

@Component({
  selector: 'app-watchlist-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="watchlist-list-container">
      <mat-card class="watchlist-card">
        <mat-card-header>
          <h2>My Watchlists</h2>
          <button mat-raised-button color="primary" (click)="createNewWatchlist()">
            <mat-icon>add</mat-icon>
            Create Watchlist
          </button>
        </mat-card-header>
        
        <mat-card-content>
          <div class="watchlist-grid" *ngIf="watchlists.length > 0; else noWatchlists">
            <mat-card class="watchlist-item" *ngFor="let watchlist of watchlists">
              <mat-card-header>
                <h3>{{ watchlist.name }}</h3>
                <button mat-icon-button (click)="deleteWatchlist(watchlist.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-header>
              <mat-card-content>
                <div class="symbols-container">
                  <div class="symbols-list">
                    <span *ngFor="let symbol of watchlist.symbols" class="symbol-chip">
                      {{ symbol }}
                      <button mat-icon-button size="small" (click)="removeSymbol(watchlist.id, symbol)">
                        <mat-icon>cancel</mat-icon>
                      </button>
                    </span>
                  </div>
                </div>
                <div class="watchlist-actions">
                  <button mat-button color="primary" (click)="viewWatchlist(watchlist)">
                    <mat-icon>visibility</mat-icon>
                    View Details
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <ng-template #noWatchlists>
            <div class="no-watchlists">
              <mat-icon class="no-data-icon">star_border</mat-icon>
              <h3>No Watchlists Found</h3>
              <p>Create your first watchlist to start tracking stocks!</p>
              <button mat-raised-button color="primary" (click)="createNewWatchlist()">
                <mat-icon>add</mat-icon>
                Create Watchlist
              </button>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .watchlist-list-container {
      padding: 20px;
    }

    .watchlist-card {
      margin-bottom: 20px;
    }

    .watchlist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .watchlist-item {
      margin-bottom: 0;
    }

    .symbols-container {
      margin-bottom: 15px;
    }

    .watchlist-actions {
      display: flex;
      justify-content: flex-end;
    }

    .no-watchlists {
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

    .no-watchlists h3 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .no-watchlists p {
      margin: 0 0 20px 0;
    }
  `]
})
export class WatchlistListComponent implements OnInit {
  watchlists: Watchlist[] = [];

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadWatchlists();
  }

  loadWatchlists(): void {
    const userId = 'current-user';
    this.apiService.getUserWatchlists(userId).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.watchlists = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading watchlists:', error);
      }
    });
  }

  createNewWatchlist(): void {
    console.log('Navigate to create watchlist');
  }

  viewWatchlist(watchlist: Watchlist): void {
    console.log('View watchlist:', watchlist);
  }

  deleteWatchlist(watchlistId: string): void {
    console.log('Delete watchlist:', watchlistId);
  }

  removeSymbol(watchlistId: string, symbol: string): void {
    this.apiService.removeSymbolFromWatchlist(watchlistId, symbol).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.loadWatchlists();
          this.snackBar.open('Symbol removed from watchlist', 'Close', { duration: 3000 });
        }
      },
      error: (error: any) => {
        console.error('Error removing symbol:', error);
      }
    });
  }
}
