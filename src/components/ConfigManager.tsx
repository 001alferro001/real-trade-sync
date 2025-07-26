import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, 
  Wifi, 
  Volume2, 
  BookOpen, 
  Bot, 
  Save,
  RotateCcw,
  AlertTriangle,
  Settings2
} from "lucide-react";

// Типы конфигурации на основе backend
interface DatabaseConfig {
  DB_USER: string;
  DB_PASSWORD: string;
  DB_HOST: string;
  DB_PORT: string;
  DB_NAME: string;
}

interface WebSocketConfig {
  LOCAL_WS_PORT: string;
  WS_PING_INTERVAL: string;
  WS_PING_TIMEOUT: string;
  WS_CLOSE_TIMEOUT: string;
  WS_MAX_SIZE: string;
}

interface VolumeConfig {
  VOLUME_WINDOW_MINUTES: string;
  VOLUME_MULTIPLIER: string;
  MIN_VOLUME_USDT: string;
  WASH_TRADE_THRESHOLD_RATIO: string;
  PING_PONG_WINDOW_SEC: string;
  RAMPING_WINDOW_SEC: string;
  CONSECUTIVE_LONG_COUNT: string;
  ALERT_GROUPING_MINUTES: string;
  DATA_RETENTION_HOURS: string;
  VOLUME_TYPE: string;
}

interface OrderBookConfig {
  ORDERBOOK_ENABLED: string;
  ORDERBOOK_SNAPSHOT_ON_ALERT: string;
  OB_HISTORY_DEPTH: string;
  ICEBERG_WINDOW_SEC: string;
  ICEBERG_VOLUME_RATIO: string;
  ICEBERG_MIN_COUNT: string;
  LAYERING_DISTANCE_PERCENT: string;
  LAYERING_MIN_CHANGE: string;
  LAYERING_WINDOW_SEC: string;
  SPOOFING_CANCEL_RATIO: string;
  MOMENTUM_IGNITION_THRESHOLD: string;
  OB_IMBALANCE_THRESHOLD: string;
}

interface MLConfig {
  ML_DATA_COLLECTOR_INTERVAL_SEC: string;
  ML_MODEL_TRAINING_INTERVAL_HOURS: string;
}

interface Config extends DatabaseConfig, WebSocketConfig, VolumeConfig, OrderBookConfig, MLConfig {}

interface ConfigManagerProps {
  onSave: (config: Config) => Promise<void>;
  onRestart: () => Promise<void>;
}

export function ConfigManager({ onSave, onRestart }: ConfigManagerProps) {
  const [config, setConfig] = useState<Config>({} as Config);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await fetch('http://localhost:8000/api/config').then(res => res.json()).catch(() => ({
        // Fallback конфигурация для разработки
        DB_HOST: "localhost",
        DB_PORT: "5432",
        DB_NAME: "cryptoscan_db",
        DB_USER: "your_db_user",
        DB_PASSWORD: "your_db_password",
        LOCAL_WS_PORT: "8766",
        WS_PING_INTERVAL: "20",
        WS_PING_TIMEOUT: "10",
        WS_CLOSE_TIMEOUT: "10",
        WS_MAX_SIZE: "10000000",
        VOLUME_WINDOW_MINUTES: "5",
        VOLUME_MULTIPLIER: "3.5",
        MIN_VOLUME_USDT: "25000",
        WASH_TRADE_THRESHOLD_RATIO: "0.88",
        PING_PONG_WINDOW_SEC: "25",
        RAMPING_WINDOW_SEC: "50",
        CONSECUTIVE_LONG_COUNT: "7",
        ALERT_GROUPING_MINUTES: "10",
        DATA_RETENTION_HOURS: "24",
        VOLUME_TYPE: "long",
        ORDERBOOK_ENABLED: "true",
        ORDERBOOK_SNAPSHOT_ON_ALERT: "true",
        OB_HISTORY_DEPTH: "50",
        ICEBERG_WINDOW_SEC: "15",
        ICEBERG_VOLUME_RATIO: "2.2",
        ICEBERG_MIN_COUNT: "6",
        LAYERING_DISTANCE_PERCENT: "0.0015",
        LAYERING_MIN_CHANGE: "250",
        LAYERING_WINDOW_SEC: "5",
        SPOOFING_CANCEL_RATIO: "0.8",
        MOMENTUM_IGNITION_THRESHOLD: "0.025",
        OB_IMBALANCE_THRESHOLD: "0.75",
        ML_DATA_COLLECTOR_INTERVAL_SEC: "5",
        ML_MODEL_TRAINING_INTERVAL_HOURS: "24"
      }));
      setConfig(data);
    } catch (error) {
      console.error('Ошибка загрузки конфигурации:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить конфигурацию",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key: keyof Config, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      [key]: value.toString()
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave(config);
      setHasChanges(false);
      toast({
        title: "Успех",
        description: "Конфигурация сохранена",
        variant: "default",
      });
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить конфигурацию",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndRestart = async () => {
    try {
      await handleSave();
      await onRestart();
      toast({
        title: "Система перезапущена",
        description: "Новые настройки применены",
        variant: "default",
      });
    } catch (error) {
      console.error('Ошибка перезапуска:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось перезапустить систему",
        variant: "destructive",
      });
    }
  };

  const renderField = (key: keyof Config, label: string, type: 'text' | 'number' | 'boolean' = 'text', description?: string) => {
    const value = config[key] || '';
    
    if (type === 'boolean') {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor={key}>{label}</Label>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <Switch
              id={key}
              checked={value === 'true'}
              onCheckedChange={(checked) => handleConfigChange(key, checked)}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label htmlFor={key}>{label}</Label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        <Input
          id={key}
          type={type}
          value={value}
          onChange={(e) => handleConfigChange(key, e.target.value)}
          placeholder={label}
        />
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Управление конфигурацией</h2>
          <p className="text-muted-foreground">Настройте параметры системы анализа криптовалютных манипуляций</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="warning" className="animate-pulse">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Есть несохраненные изменения
            </Badge>
          )}
          <Button onClick={handleSave} disabled={loading || !hasChanges} variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </Button>
          <Button onClick={handleSaveAndRestart} disabled={loading} variant="default">
            <RotateCcw className="h-4 w-4 mr-2" />
            Сохранить и перезапустить
          </Button>
        </div>
      </div>

      <Tabs defaultValue="database" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            База данных
          </TabsTrigger>
          <TabsTrigger value="websocket" className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            WebSocket
          </TabsTrigger>
          <TabsTrigger value="volume" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Объемы
          </TabsTrigger>
          <TabsTrigger value="orderbook" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Ордербук
          </TabsTrigger>
          <TabsTrigger value="ml" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            ML модель
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Настройки базы данных
              </CardTitle>
              <CardDescription>
                Конфигурация подключения к PostgreSQL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderField('DB_HOST', 'Хост базы данных', 'text', 'IP адрес или домен сервера БД')}
              {renderField('DB_PORT', 'Порт', 'number', 'Порт для подключения (обычно 5432)')}
              {renderField('DB_NAME', 'Имя базы данных', 'text')}
              {renderField('DB_USER', 'Пользователь', 'text')}
              {renderField('DB_PASSWORD', 'Пароль', 'text')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="websocket" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Настройки WebSocket
              </CardTitle>
              <CardDescription>
                Конфигурация WebSocket соединений для получения данных
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderField('LOCAL_WS_PORT', 'Локальный порт WS', 'number', 'Порт для локального WebSocket сервера')}
              {renderField('WS_PING_INTERVAL', 'Интервал ping (сек)', 'number', 'Интервал отправки ping сообщений')}
              {renderField('WS_PING_TIMEOUT', 'Timeout ping (сек)', 'number', 'Таймаут ожидания pong ответа')}
              {renderField('WS_CLOSE_TIMEOUT', 'Timeout закрытия (сек)', 'number', 'Таймаут закрытия соединения')}
              {renderField('WS_MAX_SIZE', 'Максимальный размер', 'number', 'Максимальный размер сообщения в байтах')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Настройки анализа объемов
              </CardTitle>
              <CardDescription>
                Параметры для детекции манипуляций по объемам
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderField('VOLUME_WINDOW_MINUTES', 'Окно анализа (мин)', 'number', 'Временное окно для анализа объемов')}
              {renderField('VOLUME_MULTIPLIER', 'Множитель объема', 'number', 'Множитель для детекции аномальных объемов')}
              {renderField('MIN_VOLUME_USDT', 'Минимальный объем USDT', 'number', 'Минимальный объем для срабатывания алерта')}
              {renderField('WASH_TRADE_THRESHOLD_RATIO', 'Порог wash trading', 'number', 'Порог соотношения для детекции wash trading')}
              <Separator />
              {renderField('PING_PONG_WINDOW_SEC', 'Окно ping-pong (сек)', 'number', 'Временное окно для детекции ping-pong')}
              {renderField('RAMPING_WINDOW_SEC', 'Окно ramping (сек)', 'number', 'Временное окно для детекции ramping')}
              {renderField('CONSECUTIVE_LONG_COUNT', 'Количество последовательных', 'number', 'Количество последовательных длинных сделок')}
              {renderField('ALERT_GROUPING_MINUTES', 'Группировка алертов (мин)', 'number', 'Время группировки схожих алертов')}
              {renderField('DATA_RETENTION_HOURS', 'Хранение данных (часы)', 'number', 'Время хранения исторических данных')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orderbook" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Настройки анализа ордербука
              </CardTitle>
              <CardDescription>
                Параметры для детекции манипуляций в ордербуке
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderField('ORDERBOOK_ENABLED', 'Включить анализ ордербука', 'boolean')}
              {renderField('ORDERBOOK_SNAPSHOT_ON_ALERT', 'Снапшот при алерте', 'boolean')}
              {renderField('OB_HISTORY_DEPTH', 'Глубина истории', 'number', 'Количество уровней ордербука для анализа')}
              <Separator />
              {renderField('ICEBERG_WINDOW_SEC', 'Окно Iceberg (сек)', 'number')}
              {renderField('ICEBERG_VOLUME_RATIO', 'Соотношение Iceberg', 'number')}
              {renderField('ICEBERG_MIN_COUNT', 'Минимальное количество Iceberg', 'number')}
              <Separator />
              {renderField('LAYERING_DISTANCE_PERCENT', 'Дистанция Layering (%)', 'number')}
              {renderField('LAYERING_MIN_CHANGE', 'Минимальное изменение Layering', 'number')}
              {renderField('LAYERING_WINDOW_SEC', 'Окно Layering (сек)', 'number')}
              <Separator />
              {renderField('SPOOFING_CANCEL_RATIO', 'Соотношение отмен Spoofing', 'number')}
              {renderField('MOMENTUM_IGNITION_THRESHOLD', 'Порог Momentum Ignition', 'number')}
              {renderField('OB_IMBALANCE_THRESHOLD', 'Порог дисбаланса ордербука', 'number')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ml" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Настройки ML модели
              </CardTitle>
              <CardDescription>
                Параметры машинного обучения и прогнозирования
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderField('ML_DATA_COLLECTOR_INTERVAL_SEC', 'Интервал сбора данных (сек)', 'number', 'Частота сбора данных для ML')}
              {renderField('ML_MODEL_TRAINING_INTERVAL_HOURS', 'Интервал обучения (часы)', 'number', 'Частота переобучения модели')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}