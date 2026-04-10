import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TradingComponent } from './components/trading/trading.component';
import { PortfolioComponent } from './components/portfolio/portfolio.component';
import { OrdersComponent } from './components/orders/orders.component';
import { WatchlistComponent } from './components/watchlist/watchlist.component';
import { MarketDataComponent } from './components/market-data/market-data.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { LoginComponent } from './components/auth/login/login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'trading', 
    component: TradingComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'portfolio', 
    component: PortfolioComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'orders', 
    component: OrdersComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'watchlist', 
    component: WatchlistComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'market', 
    component: MarketDataComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'analytics', 
    component: AnalyticsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: '', 
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  { 
    path: '**', 
    redirectTo: '/dashboard'
  }
];
