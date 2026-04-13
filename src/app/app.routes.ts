import { Routes } from '@angular/router';
import { SimpleLoginComponent } from './components/auth/simple-login/simple-login.component';
import { SimpleSignupComponent } from './components/auth/simple-signup/simple-signup.component';
import { SimpleDashboardComponent } from './components/dashboard/simple-dashboard/simple-dashboard.component';
import { AuthGuard } from './guards/auth.guard';

// Lazy loaded modules (will be created)
const PortfolioModule = () => import('./modules/portfolio/portfolio.module').then(m => m.PortfolioModule);
const OrdersModule = () => import('./modules/orders/orders.module').then(m => m.OrdersModule);
const TradesModule = () => import('./modules/trades/trades.module').then(m => m.TradesModule);
const WatchlistModule = () => import('./modules/watchlist/watchlist.module').then(m => m.WatchlistModule);
const MarketModule = () => import('./modules/market/market.module').then(m => m.MarketModule);
const AnalyticsModule = () => import('./modules/analytics/analytics.module').then(m => m.AnalyticsModule);

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: SimpleLoginComponent },
  { path: 'signup', component: SimpleSignupComponent },
  { 
    path: 'dashboard', 
    component: SimpleDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'portfolio',
    loadChildren: PortfolioModule,
    canActivate: [AuthGuard]
  },
  {
    path: 'orders',
    loadChildren: OrdersModule,
    canActivate: [AuthGuard]
  },
  {
    path: 'trades',
    loadChildren: TradesModule,
    canActivate: [AuthGuard]
  },
  {
    path: 'watchlist',
    loadChildren: WatchlistModule,
    canActivate: [AuthGuard]
  },
  {
    path: 'market',
    loadChildren: MarketModule,
    canActivate: [AuthGuard]
  },
  {
    path: 'analytics',
    loadChildren: AnalyticsModule,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
