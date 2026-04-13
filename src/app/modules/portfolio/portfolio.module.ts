import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

import { PortfolioComponent } from './components/portfolio.component';
import { PortfolioHoldingsComponent } from './components/portfolio-holdings.component';
import { PortfolioPerformanceComponent } from './components/portfolio-performance.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: PortfolioComponent,
        children: [
          { path: '', redirectTo: 'holdings', pathMatch: 'full' },
          { path: 'holdings', component: PortfolioHoldingsComponent },
          { path: 'performance', component: PortfolioPerformanceComponent }
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
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatToolbarModule,
      ],
  })
export class PortfolioModule { }
