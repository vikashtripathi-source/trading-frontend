import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';

import { MarketComponent } from './components/market.component';
import { MarketSearchComponent } from './components/market-search.component';
import { MarketDataComponent } from './components/market-data.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: MarketComponent,
        children: [
          { path: '', redirectTo: 'search', pathMatch: 'full' },
          { path: 'search', component: MarketSearchComponent },
          { path: 'data/:symbol', component: MarketDataComponent }
        ]
      }
    ]),
    MatCardModule,
    MatTableModule,
    MatTable,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatChipsModule,
    MatInputModule,
      ],
  })
export class MarketModule { }
