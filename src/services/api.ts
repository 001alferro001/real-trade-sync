// API сервис для подключения к backend CryptoScan
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Системные методы
  async getSystemStatus() {
    return this.request<{ status: 'running' | 'stopped' | 'restarting' }>('/api/system/status');
  }

  async startSystem() {
    return this.request('/api/system/start', { method: 'POST' });
  }

  async stopSystem() {
    return this.request('/api/system/stop', { method: 'POST' });
  }

  async restartSystem() {
    return this.request('/api/system/restart', { method: 'POST' });
  }

  // Конфигурация
  async getConfig() {
    return this.request<Record<string, string>>('/api/config');
  }

  async updateConfig(config: Record<string, string>) {
    return this.request('/api/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  // Watchlist
  async getWatchlist() {
    return this.request<any[]>('/api/watchlist');
  }

  async getWatchlistCount() {
    return this.request<{ count: number }>('/api/watchlist/count');
  }

  async addToWatchlist(data: {
    symbol: string;
    price_drop: number;
    current_price: number;
    historical_price: number;
  }) {
    return this.request('/api/watchlist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWatchlistItem(id: number, data: { is_active?: boolean; symbol?: string }) {
    return this.request(`/api/watchlist/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWatchlistItem(id: number) {
    return this.request(`/api/watchlist/${id}`, {
      method: 'DELETE',
    });
  }

  // Алерты
  async getAlerts(filters: {
    symbol?: string;
    alert_type?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    
    return this.request<any[]>(`/api/alerts?${params}`);
  }

  async getAlertsCount() {
    return this.request<{ count: number }>('/api/alerts/count');
  }

  async updateAlert(id: number, data: { status?: string; is_true_signal?: boolean }) {
    return this.request(`/api/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ML данные
  async getMLStats() {
    return this.request<{
      total_training_data: number;
      model_accuracy: number;
      last_training: string;
      predictions_today: number;
    }>('/api/ml/stats');
  }

  async retrainModel() {
    return this.request('/api/ml/retrain', { method: 'POST' });
  }

  // Статистика
  async getSystemStats() {
    return this.request<{
      uptime: number;
      active_connections: number;
      processed_trades: number;
      memory_usage: number;
      cpu_usage: number;
    }>('/api/stats');
  }
}

export const apiService = new ApiService();
export default apiService;