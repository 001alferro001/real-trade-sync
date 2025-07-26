import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Trade {
  id: string;
  price: number;
  quantity: number;
  timestamp: number;
  side: 'buy' | 'sell';
  value: number;
}

interface TradeTapeProps {
  symbol: string;
}

export const TradeTape = ({ symbol }: TradeTapeProps) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate initial trades
    const generateTrades = (count: number = 50): Trade[] => {
      const basePrice = 45000 + Math.random() * 10000;
      const newTrades: Trade[] = [];
      
      for (let i = 0; i < count; i++) {
        const price = basePrice + (Math.random() - 0.5) * 1000;
        const quantity = Math.random() * 5 + 0.001;
        const side = Math.random() > 0.5 ? 'buy' : 'sell';
        const timestamp = Date.now() - (count - i) * 1000;
        
        newTrades.push({
          id: `trade-${timestamp}-${i}`,
          price: Number(price.toFixed(2)),
          quantity: Number(quantity.toFixed(6)),
          timestamp,
          side,
          value: Number((price * quantity).toFixed(2))
        });
      }
      
      return newTrades.sort((a, b) => b.timestamp - a.timestamp);
    };

    // Initial load
    setTrades(generateTrades());
    setLoading(false);

    // Simulate real-time updates
    const interval = setInterval(() => {
      const basePrice = 45000 + Math.random() * 10000;
      const newTrade: Trade = {
        id: `trade-${Date.now()}`,
        price: Number((basePrice + (Math.random() - 0.5) * 1000).toFixed(2)),
        quantity: Number((Math.random() * 5 + 0.001).toFixed(6)),
        side: Math.random() > 0.5 ? 'buy' : 'sell',
        timestamp: Date.now(),
        value: 0
      };
      newTrade.value = Number((newTrade.price * newTrade.quantity).toFixed(2));

      setTrades(prev => [newTrade, ...prev.slice(0, 99)]);
    }, 1000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [symbol]);

  const formatPrice = (price: number) => price.toLocaleString('ru-RU', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });

  const formatQuantity = (quantity: number) => quantity.toFixed(6);

  const formatValue = (value: number) => value.toLocaleString('ru-RU', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Лента сделок</CardTitle>
          <Badge variant="outline">{symbol}</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Header */}
        <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground border-b pb-2 mb-4">
          <div className="text-left">Время</div>
          <div className="text-right">Цена (USDT)</div>
          <div className="text-right">Количество</div>
          <div className="text-right">Сумма (USDT)</div>
        </div>

        {/* Trades List */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-1">
            {trades.map((trade, index) => (
              <div
                key={trade.id}
                className={`grid grid-cols-4 gap-4 text-sm py-2 px-2 rounded transition-all duration-200 ${
                  index === 0 ? 'animate-fade-in' : ''
                } ${
                  trade.side === 'buy' 
                    ? 'hover:bg-green-50 border-l-2 border-l-green-500' 
                    : 'hover:bg-red-50 border-l-2 border-l-red-500'
                }`}
              >
                <div className="text-left font-mono text-muted-foreground">
                  {formatTime(trade.timestamp)}
                </div>
                <div 
                  className={`text-right font-mono font-medium ${
                    trade.side === 'buy' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatPrice(trade.price)}
                </div>
                <div className="text-right font-mono">
                  {formatQuantity(trade.quantity)}
                </div>
                <div className="text-right font-mono text-muted-foreground">
                  {formatValue(trade.value)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Statistics */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-muted-foreground">Всего сделок</div>
              <div className="font-bold text-lg">{trades.length}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">Последняя цена</div>
              <div 
                className={`font-bold text-lg ${
                  trades[0]?.side === 'buy' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trades[0] ? formatPrice(trades[0].price) : '—'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};