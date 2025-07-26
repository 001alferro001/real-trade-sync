import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, BarChart3, BookOpen, Scroll } from "lucide-react";
import { apiService } from "@/services/api";
import { TradingViewWidget } from "./TradingViewWidget";
import { OrderBook } from "./OrderBook";
import { TradeTape } from "./TradeTape";

interface TradingPair {
  id: string;
  symbol: string;
  base_asset: string;
  quote_asset: string;
  price: number;
  price_change_24h: number;
  volume_24h: number;
  is_active: boolean;
  last_update: string;
}

export const TradingPairs = () => {
  const [pairs, setPairs] = useState<TradingPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [showOrderBook, setShowOrderBook] = useState(false);
  const [showTradeTape, setShowTradeTape] = useState(false);

  useEffect(() => {
    loadTradingPairs();
  }, []);

  const loadTradingPairs = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTradingPairs();
      setPairs(data.pairs || []);
    } catch (error) {
      console.error('Ошибка загрузки торговых пар:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePairClick = (pair: TradingPair) => {
    setSelectedPair(pair);
    setShowChart(true);
  };

  const formatPrice = (price: number) => {
    return price.toFixed(8).replace(/\.?0+$/, '');
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toFixed(2);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-8 bg-muted rounded w-full" />
              <div className="flex justify-between">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Торговые пары</h2>
            <p className="text-muted-foreground">
              Активные торговые пары в системе мониторинга
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {pairs.length} пар
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pairs.map((pair) => (
            <Card
              key={pair.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/20"
              onClick={() => handlePairClick(pair)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">
                    {pair.symbol}
                  </CardTitle>
                  <Badge
                    variant={pair.is_active ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {pair.is_active ? "Активна" : "Неактивна"}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {pair.base_asset} / {pair.quote_asset}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    ${formatPrice(pair.price)}
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      pair.price_change_24h >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {pair.price_change_24h >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {Math.abs(pair.price_change_24h).toFixed(2)}%
                  </div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Объем 24ч:</span>
                  <span className="font-medium">
                    ${formatVolume(pair.volume_24h)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Chart Modal */}
      <Dialog open={showChart} onOpenChange={setShowChart}>
        <DialogContent className="max-w-7xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                {selectedPair?.symbol} - График
              </DialogTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowOrderBook(true);
                    setShowChart(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Стакан
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowTradeTape(true);
                    setShowChart(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <Scroll className="h-4 w-4" />
                  Лента сделок
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="h-[600px] w-full">
            {selectedPair && (
              <TradingViewWidget symbol={selectedPair.symbol} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* OrderBook Modal */}
      <Dialog open={showOrderBook} onOpenChange={setShowOrderBook}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                {selectedPair?.symbol} - Стакан заявок
              </DialogTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowChart(true);
                    setShowOrderBook(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  График
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowTradeTape(true);
                    setShowOrderBook(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <Scroll className="h-4 w-4" />
                  Лента сделок
                </Button>
              </div>
            </div>
          </DialogHeader>
          {selectedPair && (
            <OrderBook symbol={selectedPair.symbol} />
          )}
        </DialogContent>
      </Dialog>

      {/* Trade Tape Modal */}
      <Dialog open={showTradeTape} onOpenChange={setShowTradeTape}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                {selectedPair?.symbol} - Лента сделок
              </DialogTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowChart(true);
                    setShowTradeTape(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  График
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowOrderBook(true);
                    setShowTradeTape(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Стакан
                </Button>
              </div>
            </div>
          </DialogHeader>
          {selectedPair && (
            <TradeTape symbol={selectedPair.symbol} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};