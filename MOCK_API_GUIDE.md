# Mock API Setup Guide

## Problem
The Angular trading application expects a backend API at `http://localhost:8081/api`, but currently no trading API backend is running on that port, resulting in 404 errors.

## Solution
A mock API service has been implemented to provide realistic mock data for development and testing purposes.

## How to Use Mock API

### 1. Enable Mock Mode
The mock API is currently enabled by setting `useMockApi: true` in `src/environments/environment.ts`.

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/api',
  wsUrl: 'ws://localhost:8081/ws',
  useMockApi: true  // This enables mock data
};
```

### 2. Login with Demo Credentials
Use the following credentials to login:
- **Email**: `test@example.com`
- **Password**: `password`

Or click the "Fill Demo Credentials" button on the login page.

### 3. Available Mock Features
- **Authentication**: Login, logout, profile retrieval
- **Portfolio**: User portfolio with holdings, P&L calculations
- **Market Data**: Real-time stock prices, market indices
- **Analytics**: Trading statistics, performance metrics, trade analysis
- **Top Gainers/Losers**: Market movers with realistic data

## Switching to Real Backend

When your actual trading API backend is ready:

### Option 1: Change Port
If your backend runs on a different port (e.g., 8080):

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',  // Change port
  wsUrl: 'ws://localhost:8080/ws',
  useMockApi: false  // Disable mock API
};
```

### Option 2: Start Your Backend
1. Start your trading API backend on port 8081
2. Set `useMockApi: false` in environment.ts
3. Restart the Angular development server

## Mock API Features

### Authentication
- Mock JWT token generation
- User profile management
- Session handling

### Portfolio Data
- Multiple holdings (AAPL, GOOGL, MSFT)
- Realistic P&L calculations
- Portfolio performance metrics

### Market Data
- Dynamic price generation
- Market indices (S&P 500, NASDAQ, DOW, RUSSELL 2000)
- Top gainers and losers lists

### Analytics
- Trading statistics (win rate, profit factor, etc.)
- Performance metrics (Sharpe ratio, max drawdown, etc.)
- Trade analysis and breakdowns

## Development Benefits

1. **No Backend Dependency**: Work offline without needing the actual backend
2. **Realistic Data**: Mock data mimics real trading application behavior
3. **Fast Development**: Instant responses with realistic delays
4. **Testing**: Perfect for frontend development and UI testing

## Next Steps

1. **Develop Backend**: Build your actual trading API backend
2. **Data Migration**: Plan how to migrate from mock to real data
3. **Environment Management**: Set up different configs for dev/staging/prod
4. **API Documentation**: Document your real API endpoints

## Troubleshooting

### Still Getting 404 Errors?
- Ensure `useMockApi: true` is set in environment.ts
- Restart the Angular development server after changes
- Check browser console for any JavaScript errors

### Mock Data Not Loading?
- Verify MockApiService is properly imported in ApiService
- Check that all API methods have mock implementations
- Ensure the login credentials match the mock service expectations

### Want to Add More Mock Data?
Edit `src/app/services/mock-api.service.ts` to add:
- More mock stocks and holdings
- Different user scenarios
- Additional market data
- Custom analytics data
