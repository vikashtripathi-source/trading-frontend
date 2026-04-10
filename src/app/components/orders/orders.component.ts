import { Component } from '@angular/core';

@Component({
  selector: 'app-orders',
  standalone: true,
  template: `
    <div class="page-placeholder">
      <h2>Order Management</h2>
      <p>View, manage, and track your active and completed orders.</p>
      <div class="coming-soon">
        <span>Coming Soon</span>
      </div>
    </div>
  `,
  styles: [`
    .page-placeholder {
      padding: 40px;
      text-align: center;
      background: white;
      border-radius: 12px;
      margin: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .page-placeholder h2 {
      color: #2196f3;
      margin-bottom: 16px;
    }
    .coming-soon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 20px;
      display: inline-block;
      margin-top: 20px;
      font-weight: 600;
    }
  `]
})
export class OrdersComponent {}
