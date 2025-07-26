import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastPrice: number;
  priceChange: number;
  symbol: string;
}

interface OrderBookProps {
  symbol: string;
}

export const OrderBook = ({ symbol }: OrderBookProps) => {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading order book data
    const loadOrderBook = () => {
      setLoading(true);
      
      // Simulate API call with timeout
      setTimeout(() => {
        const basePrice = 45000 + Math.random() * 10000;
        const priceChange = (Math.random() - 0.5) * 10;
        
        const generateOrders = (isAsk: boolean, count: number = 15): OrderBookEntry[] => {
          const orders: OrderBookEntry[] = [];
          let total = 0;
          
          for (let i = 0; i < count; i++) {
            const priceOffset = isAsk ? (i + 1) * 5 : -(i + 1) * 5;
            const price = basePrice + priceOffset + (Math.random() - 0.5) * 10;
            const quantity = Math.random() * 2 + 0.1;
            total += quantity;
            
            orders.push({
              price: Number(price.toFixed(2)),
              quantity: Number(quantity.toFixed(6)),
              total: Number(total.toFixed(6))
            });
          }
          
          return orders;
        };

        setOrderBook({
          symbol,
          lastPrice: Number(basePrice.toFixed(2)),
          priceChange,
          bids: generateOrders(false).reverse(),
          asks: generateOrders(true)
        });
        setLoading(false);
      }, 1000);
    };

    loadOrderBook();
    const interval = setInterval(loadOrderBook, 2000);
    
    return () => clearInterval(interval);
  }, [symbol]);

  const formatPrice = (price: number) => price.toLocaleString('ru-RU', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });

  const formatQuantity = (quantity: number) => quantity.toFixed(6);

  if (loading || !orderBook) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Стакан заявок</CardTitle>
          <Badge variant="outline">{orderBook.symbol}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Header */}
        <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
          <div className="text-left">Цена (USDT)</div>
          <div className="text-center">Количество</div>
          <div className="text-right">Сумма</div>
        </div>

        {/* Asks (Продажа) */}
        <div className="space-y-1">
          {orderBook.asks.slice().reverse().map((ask, index) => (
            <div
              key={`ask-${index}`}
              className="grid grid-cols-3 gap-4 text-sm hover:bg-red-50 transition-colors py-1 px-2 rounded relative"
            >
              <div
                className="absolute inset-0 bg-red-100 opacity-30"
                style={{
                  width: `${(ask.total / Math.max(...orderBook.asks.map(a => a.total))) * 100}%`,
                  right: 0
                }}
              />
              <div className="text-left font-mono text-red-600 relative z-10">
                {formatPrice(ask.price)}
              </div>
              <div className="text-center font-mono relative z-10">
                {formatQuantity(ask.quantity)}
              </div>
              <div className="text-right font-mono text-sm text-muted-foreground relative z-10">
                {formatQuantity(ask.total)}
              </div>
            </div>
          ))}
        </div>

        {/* Current Price */}
        <div className="py-4">
          <Separator className="mb-4" />
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">
              {formatPrice(orderBook.lastPrice)}
            </div>
            <div
              className={`text-sm font-medium ${
                orderBook.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {orderBook.priceChange >= 0 ? '+' : ''}
              {orderBook.priceChange.toFixed(2)}%
            </div>
          </div>
          <Separator className="mt-4" />
        </div>

        {/* Bids (Покупка) */}
        <div className="space-y-1">
          {orderBook.bids.map((bid, index) => (
            <div
              key={`bid-${index}`}
              className="grid grid-cols-3 gap-4 text-sm hover:bg-green-50 transition-colors py-1 px-2 rounded relative"
            >
              <div
                className="absolute inset-0 bg-green-100 opacity-30"
                style={{
                  width: `${(bid.total / Math.max(...orderBook.bids.map(b => b.total))) * 100}%`,
                  right: 0
                }}
              />
              <div className="text-left font-mono text-green-600 relative z-10">
                {formatPrice(bid.price)}
              </div>
              <div className="text-center font-mono relative z-10">
                {formatQuantity(bid.quantity)}
              </div>
              <div className="text-right font-mono text-sm text-muted-foreground relative z-10">
                {formatQuantity(bid.total)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};