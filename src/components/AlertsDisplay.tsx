import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Filter,
  RefreshCw,
  Volume2,
  Layers
} from "lucide-react";

interface Alert {
  id: number;
  symbol: string;
  alert_type: string;
  price: number;
  alert_timestamp_ms: number;
  alert_start_time: string;
  alert_end_time: string;
  message: string;
  volume_ratio: number;
  current_volume_usdt: number;
  average_volume_usdt: number;
  consecutive_count: number;
  grouped_alerts_count: number;
  is_grouped: boolean;
  group_id: string;
  has_imbalance: boolean;
  imbalance_data: any;
  candle_data: any;
  order_book_snapshot: any;
  trade_history: any;
  status: string;
  is_true_signal: boolean;
  predicted_price_change: number;
  predicted_direction: string;
  ml_source_alert_type: string;
  created_at: string;
}

interface AlertsDisplayProps {
  refreshInterval?: number;
}

export function AlertsDisplay({ refreshInterval = 5000 }: AlertsDisplayProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    symbol: '',
    alert_type: '',
    status: '',
    date_from: '',
    date_to: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const data = await fetch(`http://localhost:8000/api/alerts?${params}`).then(res => res.json()).catch(() => [
        // Пример данных для разработки
        {
          id: 1,
          symbol: "BTCUSDT",
          alert_type: "volume_spike",
          price: 45123.45,
          alert_timestamp_ms: Date.now(),
          alert_start_time: new Date().toISOString(),
          alert_end_time: new Date().toISOString(),
          message: "Обнаружен всплеск объема на BTCUSDT",
          volume_ratio: 4.5,
          current_volume_usdt: 150000,
          average_volume_usdt: 33333,
          consecutive_count: 3,
          grouped_alerts_count: 1,
          is_grouped: false,
          group_id: null,
          has_imbalance: true,
          imbalance_data: {},
          candle_data: {},
          order_book_snapshot: {},
          trade_history: {},
          status: "new",
          is_true_signal: null,
          predicted_price_change: 2.5,
          predicted_direction: "up",
          ml_source_alert_type: "volume_spike",
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          symbol: "ETHUSDT",
          alert_type: "wash_trading",
          price: 2801.23,
          alert_timestamp_ms: Date.now() - 300000,
          alert_start_time: new Date(Date.now() - 300000).toISOString(),
          alert_end_time: new Date().toISOString(),
          message: "Подозрение на wash trading на ETHUSDT",
          volume_ratio: 6.2,
          current_volume_usdt: 200000,
          average_volume_usdt: 32258,
          consecutive_count: 5,
          grouped_alerts_count: 1,
          is_grouped: false,
          group_id: null,
          has_imbalance: false,
          imbalance_data: {},
          candle_data: {},
          order_book_snapshot: {},
          trade_history: {},
          status: "confirmed",
          is_true_signal: true,
          predicted_price_change: -1.8,
          predicted_direction: "down",
          ml_source_alert_type: "wash_trading",
          created_at: new Date(Date.now() - 300000).toISOString()
        }
      ]);
      setAlerts(data);
    } catch (error) {
      console.error('Ошибка загрузки алертов:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'volume_spike':
        return <Volume2 className="h-4 w-4" />;
      case 'wash_trading':
        return <RefreshCw className="h-4 w-4" />;
      case 'layering':
        return <Layers className="h-4 w-4" />;
      case 'spoofing':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'volume_spike':
        return 'chart-1';
      case 'wash_trading':
        return 'destructive';
      case 'layering':
        return 'warning';
      case 'spoofing':
        return 'chart-4';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'chart-1';
      case 'confirmed':
        return 'success';
      case 'false_positive':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(2)}K`;
    }
    return volume.toFixed(2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const formatAlertType = (type: string) => {
    const types: Record<string, string> = {
      'volume_spike': 'Всплеск объема',
      'wash_trading': 'Wash Trading',
      'layering': 'Layering',
      'spoofing': 'Spoofing',
      'iceberg': 'Iceberg Order',
      'momentum_ignition': 'Momentum Ignition'
    };
    return types[type] || type;
  };

  const formatStatus = (status: string) => {
    const statuses: Record<string, string> = {
      'new': 'Новый',
      'confirmed': 'Подтвержден',
      'false_positive': 'Ложное срабатывание'
    };
    return statuses[status] || status;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Алерты манипуляций
              </CardTitle>
              <CardDescription>
                Мониторинг и анализ обнаруженных манипуляций на рынке
              </CardDescription>
            </div>
            <Button onClick={loadAlerts} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Фильтры */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Фильтры
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Символ</Label>
                  <Input
                    id="symbol"
                    placeholder="BTCUSDT"
                    value={filters.symbol}
                    onChange={(e) => setFilters(prev => ({ ...prev, symbol: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alert_type">Тип алерта</Label>
                  <Select
                    value={filters.alert_type}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, alert_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Все типы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все типы</SelectItem>
                      <SelectItem value="volume_spike">Всплеск объема</SelectItem>
                      <SelectItem value="wash_trading">Wash Trading</SelectItem>
                      <SelectItem value="layering">Layering</SelectItem>
                      <SelectItem value="spoofing">Spoofing</SelectItem>
                      <SelectItem value="iceberg">Iceberg Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Статус</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Все статусы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все статусы</SelectItem>
                      <SelectItem value="new">Новый</SelectItem>
                      <SelectItem value="confirmed">Подтвержден</SelectItem>
                      <SelectItem value="false_positive">Ложное срабатывание</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_from">Дата с</Label>
                  <Input
                    id="date_from"
                    type="datetime-local"
                    value={filters.date_from}
                    onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_to">Дата по</Label>
                  <Input
                    id="date_to"
                    type="datetime-local"
                    value={filters.date_to}
                    onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={loadAlerts}>
                  Применить фильтры
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Таблица алертов */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Время</TableHead>
                  <TableHead>Символ</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Объем</TableHead>
                  <TableHead>Соотношение</TableHead>
                  <TableHead>ML прогноз</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        {formatDate(alert.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{alert.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={getAlertTypeColor(alert.alert_type) as any} className="flex items-center gap-1">
                        {getAlertTypeIcon(alert.alert_type)}
                        {formatAlertType(alert.alert_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatPrice(alert.price)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          Текущий: <span className="font-medium">{formatVolume(alert.current_volume_usdt)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Средний: {formatVolume(alert.average_volume_usdt)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={alert.volume_ratio > 5 ? 'destructive' : alert.volume_ratio > 3 ? 'warning' : 'secondary'}>
                        {alert.volume_ratio.toFixed(2)}x
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {alert.predicted_direction && (
                        <div className="flex items-center gap-1">
                          {alert.predicted_direction === 'up' ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          )}
                          <span className="text-sm">
                            {alert.predicted_price_change ? `${alert.predicted_price_change.toFixed(2)}%` : ''}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(alert.status) as any}>
                        {formatStatus(alert.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {alerts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      {loading ? "Загрузка алертов..." : "Алертов не найдено"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}