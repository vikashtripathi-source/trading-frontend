import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface MarketDataUpdate {
  type: 'market-data';
  data: {
    symbol: string;
    price: number;
    change: number;
    timestamp: number;
  };
}

export interface PortfolioUpdate {
  type: 'portfolio-update';
  data: {
    userId: string;
    totalValue: number;
    dailyPnL: number;
    timestamp: number;
  };
}

export interface OrderStatusUpdate {
  type: 'order-status';
  data: {
    orderId: string;
    status: string;
    executedPrice?: number;
    timestamp: number;
  };
}

export type WebSocketMessage = MarketDataUpdate | PortfolioUpdate | OrderStatusUpdate;

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<WebSocketMessage>();
  private connectionStatusSubject = new Subject<boolean>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  constructor(private apiService: ApiService) {}

  connect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.socket = new WebSocket(this.apiService.getWebSocketUrl());
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.connectionStatusSubject.next(true);
        this.reconnectAttempts = 0;
        
        // Subscribe to default topics
        this.subscribe(['market-data', 'portfolio-updates', 'order-status']);
      };

      this.socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.messageSubject.next(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.connectionStatusSubject.next(false);
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connectionStatusSubject.next(false);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.attemptReconnect();
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  subscribe(topics: string[]): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        action: 'subscribe',
        topics: topics
      };
      this.socket.send(JSON.stringify(message));
    }
  }

  unsubscribe(topics: string[]): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        action: 'unsubscribe',
        topics: topics
      };
      this.socket.send(JSON.stringify(message));
    }
  }

  getMessages(): Observable<WebSocketMessage> {
    return this.messageSubject.asObservable();
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatusSubject.asObservable();
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}
